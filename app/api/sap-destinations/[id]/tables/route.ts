import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const destinationId = parseInt(id);
        const { searchParams } = new URL(request.url);
        const schemaName = searchParams.get('schema');

        if (isNaN(destinationId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid destination ID' },
                { status: 400 }
            );
        }

        if (!schemaName) {
            return NextResponse.json(
                { success: false, error: 'Schema name is required' },
                { status: 400 }
            );
        }

        // Get authorization header from incoming request
        const authHeader = request.headers.get('authorization');

        // Query to get tables for a schema
        const query = `
      SELECT TABLE_NAME, TABLE_TYPE 
      FROM TABLES 
      WHERE SCHEMA_NAME = '${schemaName}'
      ORDER BY TABLE_NAME
    `;

        // Call Nexus Core API - use NEXUS_CORE_URL for Docker, fallback to NEXT_PUBLIC_API_URL
        const coreApiUrl = process.env.NEXUS_CORE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await fetch(`${coreApiUrl}/api/v1/query`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                destination_id: destinationId,
                query_type: 'select',
                query: query,
                limit: 1000,
            }),
        });

        // Check if response is OK
        if (!response.ok) {
            const errorText = await response.text();
            console.error('SAP tables API error:', response.status, errorText);
            return NextResponse.json(
                { success: false, error: `API error: ${response.status}` },
                { status: response.status }
            );
        }

        // Try to parse JSON
        let result;
        try {
            result = await response.json();
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            return NextResponse.json(
                { success: false, error: 'Invalid response from server' },
                { status: 500 }
            );
        }

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error || 'Failed to fetch tables' },
                { status: 500 }
            );
        }

        // Extract table names from result
        const tables = result.data?.map((row: Record<string, unknown>) => ({
            name: row.TABLE_NAME || row.table_name,
            type: row.TABLE_TYPE || row.table_type,
        })) || [];

        return NextResponse.json({
            success: true,
            tables,
        });
    } catch (error) {
        console.error('Error fetching SAP tables:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
