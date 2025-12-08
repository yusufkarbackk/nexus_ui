const API_BASE_URL = 'http://localhost:8080';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export type DataFieldType = 'string' | 'number' | 'boolean' | 'json';

export interface ApplicationField {
  id: number;
  applicationId: number;
  name: string;
  dataType: DataFieldType;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationFieldPayload {
  name: string;
  dataType: DataFieldType;
  description?: string;
}

export interface Application {
  id: number;
  name: string;
  description: string | null;
  appKey: string;
  fields: ApplicationField[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationListResponse {
  success: boolean;
  message: string;
  data: Application[];
  total: number;
}

export interface CreateApplicationPayload {
  name: string;
  description?: string;
  appKey: string;
  fields?: ApplicationFieldPayload[];
}

export interface UpdateApplicationPayload {
  name?: string;
  description?: string;
  fields?: ApplicationFieldPayload[];
}

// Fetch all applications
export async function fetchApplications(): Promise<ApplicationListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/applications`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Fetch single application by ID
export async function fetchApplicationById(id: number): Promise<ApiResponse<Application>> {
  const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Create new application
export async function createApplication(payload: CreateApplicationPayload): Promise<ApiResponse<Application>> {
  const response = await fetch(`${API_BASE_URL}/api/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// Update application
export async function updateApplication(id: number, payload: UpdateApplicationPayload): Promise<ApiResponse<Application>> {
  const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// Delete application
export async function deleteApplication(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// Validate app key exists
export async function validateAppKey(appKey: string): Promise<{ success: boolean; valid: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/applications/validate/${appKey}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

// ============================================
// Destination API Functions
// ============================================

export type ConnectionType = 'mysql' | 'postgresql';
export type DestinationStatus = 'up' | 'down';

export interface Destination {
  id: number;
  name: string;
  description: string | null;
  connectionType: ConnectionType;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  status: DestinationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationListResponse {
  success: boolean;
  message: string;
  data: Destination[];
  total: number;
}

export interface CreateDestinationPayload {
  name: string;
  description?: string;
  connectionType: ConnectionType;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
}

export interface UpdateDestinationPayload {
  name?: string;
  description?: string;
  connectionType?: ConnectionType;
  host?: string;
  port?: number;
  databaseName?: string;
  username?: string;
  password?: string;
  status?: DestinationStatus;
}

export interface TestConnectionPayload {
  connectionType: ConnectionType;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  latency?: string;
}

// Fetch all destinations
export async function fetchDestinations(): Promise<DestinationListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/destinations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Fetch single destination by ID
export async function fetchDestinationById(id: number): Promise<ApiResponse<Destination>> {
  const response = await fetch(`${API_BASE_URL}/api/destinations/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Create new destination
export async function createDestination(payload: CreateDestinationPayload): Promise<ApiResponse<Destination>> {
  const response = await fetch(`${API_BASE_URL}/api/destinations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// Update destination
export async function updateDestination(id: number, payload: UpdateDestinationPayload): Promise<ApiResponse<Destination>> {
  const response = await fetch(`${API_BASE_URL}/api/destinations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// Delete destination
export async function deleteDestination(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_BASE_URL}/api/destinations/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// Test database connection
export async function testDestinationConnection(payload: TestConnectionPayload): Promise<TestConnectionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/destinations/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

// Toggle destination status (up/down)
export async function toggleDestinationStatus(id: number): Promise<{ success: boolean; message: string; status: DestinationStatus }> {
  const response = await fetch(`${API_BASE_URL}/api/destinations/${id}/toggle`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

// ============================================
// Schema Introspection API Functions
// ============================================

export interface TableInfo {
  name: string;
}

export interface ColumnInfo {
  name: string;
  dataType: string;
  isNullable: boolean;
  columnKey?: string;
  default?: string;
}

export interface TablesResponse {
  success: boolean;
  message: string;
  data: TableInfo[];
}

export interface ColumnsResponse {
  success: boolean;
  message: string;
  data: ColumnInfo[];
}

// Fetch tables from destination database
export async function fetchDestinationTables(destinationId: number): Promise<TablesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/destinations/${destinationId}/tables`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// Fetch columns for a specific table from destination database
export async function fetchTableColumns(destinationId: number, tableName: string): Promise<ColumnsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/destinations/${destinationId}/tables/${tableName}/columns`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// ============================================
// Workflow API Functions
// ============================================

export interface FieldMappingPayload {
  sourceField: string;
  destinationColumn: string;
}

export interface PipelinePayload {
  applicationId: number;
  destinationId: number;
  targetTable: string;
  isActive: boolean;
  fieldMappings: FieldMappingPayload[];
}

export interface CreateWorkflowPayload {
  name: string;
  description?: string;
  isActive: boolean;
  pipelines: PipelinePayload[];
}

export interface UpdateWorkflowPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
  pipelines?: PipelinePayload[];
}

export interface FieldMapping {
  id: number;
  pipelineId: number;
  sourceField: string;
  destinationColumn: string;
  createdAt: string;
}

export interface Pipeline {
  id: number;
  workflowId: number;
  applicationId: number;
  destinationId: number;
  targetTable: string;
  isActive: boolean;
  fieldMappings: FieldMapping[];
  application?: Application;
  destination?: Destination;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  pipelines: Pipeline[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowListResponse {
  success: boolean;
  message: string;
  data: Workflow[];
  total: number;
}

// Fetch all workflows
export async function fetchWorkflows(): Promise<WorkflowListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/workflows`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Fetch single workflow by ID
export async function fetchWorkflowById(id: number): Promise<ApiResponse<Workflow>> {
  const response = await fetch(`${API_BASE_URL}/api/workflows/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Create new workflow
export async function createWorkflow(payload: CreateWorkflowPayload): Promise<ApiResponse<Workflow>> {
  const response = await fetch(`${API_BASE_URL}/api/workflows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// Update workflow
export async function updateWorkflow(id: number, payload: UpdateWorkflowPayload): Promise<ApiResponse<Workflow>> {
  const response = await fetch(`${API_BASE_URL}/api/workflows/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// Delete workflow
export async function deleteWorkflow(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_BASE_URL}/api/workflows/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

