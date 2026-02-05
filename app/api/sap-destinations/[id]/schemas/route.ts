import { NextRequest, NextResponse } from 'next/server';

// SAP HANA system schemas to fetch (user-created schemas)
const SAP_HANA_SCHEMA_QUERY = `
SELECT SCHEMA_NAME 
FROM SCHEMAS 
WHERE HAS_PRIVILEGES = 'TRUE' 
  AND SCHEMA_NAME NOT LIKE 'SYS%'
  AND SCHEMA_NAME NOT LIKE '_SYS%'
  AND SCHEMA_NAME NOT LIKE 'HANA%'
  AND SCHEMA_NAME NOT LIKE 'SAP%'
  AND SCHEMA_NAME NOT LIKE 'UI5%'
ORDER BY SCHEMA_NAME
`;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const destinationId = parseInt(id);

        if (isNaN(destinationId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid destination ID' },
                { status: 400 }
            );
        }

        // Get authorization header from incoming request
        const authHeader = request.headers.get('authorization');

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
                query: SAP_HANA_SCHEMA_QUERY,
                limit: 1000,
            }),
        });

        // Check if response is OK
        if (!response.ok) {
            const errorText = await response.text();
            console.error('SAP schemas API error:', response.status, errorText);
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
                { success: false, error: result.error || 'Failed to fetch schemas' },
                { status: 500 }
            );
        }

        // Extract schema names from result
        const schemas = result.data?.map((row: Record<string, unknown>) => ({
            name: row.SCHEMA_NAME || row.schema_name,
        })) || [];

        return NextResponse.json({
            success: true,
            schemas,
        });
    } catch (error) {
        console.error('Error fetching SAP schemas:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
