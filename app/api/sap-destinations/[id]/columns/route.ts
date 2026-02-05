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
        const tableName = searchParams.get('table');

        if (isNaN(destinationId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid destination ID' },
                { status: 400 }
            );
        }

        if (!schemaName || !tableName) {
            return NextResponse.json(
                { success: false, error: 'Schema name and table name are required' },
                { status: 400 }
            );
        }

        // Get authorization header from incoming request
        const authHeader = request.headers.get('authorization');

        // Query to get columns for a table
        const query = `
      SELECT 
        COLUMN_NAME,
        DATA_TYPE_NAME,
        LENGTH,
        SCALE,
        IS_NULLABLE,
        DEFAULT_VALUE
      FROM TABLE_COLUMNS 
      WHERE SCHEMA_NAME = '${schemaName}'
        AND TABLE_NAME = '${tableName}'
      ORDER BY POSITION
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
            console.error('SAP columns API error:', response.status, errorText);
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
                { success: false, error: result.error || 'Failed to fetch columns' },
                { status: 500 }
            );
        }

        // Extract column info from result
        const columns = result.data?.map((row: Record<string, unknown>) => ({
            name: row.COLUMN_NAME || row.column_name,
            dataType: row.DATA_TYPE_NAME || row.data_type_name,
            length: row.LENGTH || row.length,
            scale: row.SCALE || row.scale,
            isNullable: (row.IS_NULLABLE || row.is_nullable) === 'TRUE',
            defaultValue: row.DEFAULT_VALUE || row.default_value,
        })) || [];

        return NextResponse.json({
            success: true,
            columns,
        });
    } catch (error) {
        console.error('Error fetching SAP columns:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
