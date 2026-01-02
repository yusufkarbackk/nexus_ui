const API_BASE_URL = 'http://localhost:8080';

// Get auth headers for API requests
function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('nexus_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

// Wrapper for fetch that includes auth headers
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
}

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
  encryptionEnabled?: boolean;
  secretVersion?: number;
  masterSecret?: string; // Only returned on create
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
  encryptionEnabled?: boolean;
  fields?: ApplicationFieldPayload[];
}

export interface UpdateApplicationPayload {
  name?: string;
  description?: string;
  fields?: ApplicationFieldPayload[];
}

// Fetch all applications
export async function fetchApplications(): Promise<ApplicationListResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/applications`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/applications/${id}`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/applications`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/applications/${id}`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/applications/${id}`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/applications/validate/${appKey}`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/destinations`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/destinations/${id}`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/destinations`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/destinations/${id}`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/destinations/${id}`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/destinations/test`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/destinations/${id}/toggle`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/destinations/${destinationId}/tables`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/destinations/${destinationId}/tables/${tableName}/columns`, {
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

export type DestinationType = 'database' | 'rest';

export interface PipelinePayload {
  applicationId: number;
  destinationType: DestinationType;
  // For database destinations
  destinationId?: number;
  targetTable?: string;
  // For REST destinations
  restDestinationId?: number;
  isActive: boolean;
  fieldMappings: FieldMappingPayload[];
}

export interface CreateWorkflowPayload {
  name: string;
  description?: string;
  isActive: boolean;
  redisRetentionHours?: number;
  deleteFailedImmediately?: boolean;
  pipelines: PipelinePayload[];
}

export interface UpdateWorkflowPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
  redisRetentionHours?: number;
  deleteFailedImmediately?: boolean;
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
  destinationType: DestinationType;
  // For database destinations
  destinationId?: number;
  targetTable?: string;
  destination?: Destination;
  // For REST destinations
  restDestinationId?: number;
  restDestination?: RestDestination;
  isActive: boolean;
  fieldMappings: FieldMapping[];
  application?: Application;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  redisRetentionHours?: number;
  deleteFailedImmediately?: boolean;
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
  const response = await authFetch(`${API_BASE_URL}/api/workflows`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/workflows/${id}`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/workflows`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/workflows/${id}`, {
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
  const response = await authFetch(`${API_BASE_URL}/api/workflows/${id}`, {
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

// ============================================
// REST Destination API Functions
// ============================================

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type AuthType = 'none' | 'bearer' | 'api_key' | 'basic';

export interface RestDestination {
  id: number;
  name: string;
  description: string | null;
  baseUrl: string;
  method: HTTPMethod;
  headers: string | null;  // JSON string
  authType: AuthType;
  timeoutSeconds: number;
  status: 'up' | 'down';
  createdAt: string;
  updatedAt: string;
}

export interface RestDestinationListResponse {
  success: boolean;
  message: string;
  data: RestDestination[];
  total: number;
}

export interface CreateRestDestinationPayload {
  name: string;
  description?: string;
  baseUrl: string;
  method: HTTPMethod;
  headers?: string;
  authType: AuthType;
  authConfig?: string;  // JSON string with auth details
  timeoutSeconds?: number;
}

export interface UpdateRestDestinationPayload {
  name?: string;
  description?: string;
  baseUrl?: string;
  method?: HTTPMethod;
  headers?: string;
  authType?: AuthType;
  authConfig?: string;
  timeoutSeconds?: number;
  status?: 'up' | 'down';
}

export interface TestRestConnectionPayload {
  baseUrl: string;
  method: HTTPMethod;
  headers?: string;
  authType: AuthType;
  authConfig?: string;
  timeoutSeconds?: number;
  testPayload?: string;
}

export interface TestRestConnectionResponse {
  success: boolean;
  message: string;
  statusCode?: number;
  responseBody?: string;
  latency?: string;
}

// Fetch all REST destinations
export async function fetchRestDestinations(): Promise<RestDestinationListResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/rest-destinations`, {
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

// Fetch single REST destination by ID
export async function fetchRestDestinationById(id: number): Promise<ApiResponse<RestDestination>> {
  const response = await authFetch(`${API_BASE_URL}/api/rest-destinations/${id}`, {
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

// Create new REST destination
export async function createRestDestination(payload: CreateRestDestinationPayload): Promise<ApiResponse<RestDestination>> {
  const response = await authFetch(`${API_BASE_URL}/api/rest-destinations`, {
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

// Update REST destination
export async function updateRestDestination(id: number, payload: UpdateRestDestinationPayload): Promise<ApiResponse<RestDestination>> {
  const response = await authFetch(`${API_BASE_URL}/api/rest-destinations/${id}`, {
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

// Delete REST destination
export async function deleteRestDestination(id: number): Promise<ApiResponse<null>> {
  const response = await authFetch(`${API_BASE_URL}/api/rest-destinations/${id}`, {
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

// Test REST endpoint connection
export async function testRestConnection(payload: TestRestConnectionPayload): Promise<TestRestConnectionResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/rest-destinations/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

// Toggle REST destination status
export async function toggleRestDestinationStatus(id: number): Promise<{ success: boolean; message: string; status: 'up' | 'down' }> {
  const response = await authFetch(`${API_BASE_URL}/api/rest-destinations/${id}/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

// ============================================
// MQTT Source API Functions
// ============================================

export interface MQTTSourceField {
  id: number;
  mqttSourceId: number;
  name: string;
  dataType: string;
  description?: string;
}

export interface MQTTSource {
  id: number;
  name: string;
  description?: string;
  brokerUrl: string;
  username?: string;
  clientId?: string;
  useTls: boolean;
  encryptionEnabled: boolean;
  secretVersion: number;
  isActive: boolean;
  status: 'connected' | 'disconnected' | 'error';
  fields?: MQTTSourceField[];
  createdAt: string;
  updatedAt: string;
}

export interface MQTTSourceListResponse {
  success: boolean;
  message: string;
  data: MQTTSource[];
}

// Fetch all MQTT sources
export async function fetchMqttSources(): Promise<MQTTSourceListResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/mqtt-sources`, {
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

// Fetch MQTT source fields
export async function fetchMqttSourceFields(sourceId: number): Promise<{ success: boolean; data: MQTTSourceField[] }> {
  const response = await authFetch(`${API_BASE_URL}/api/mqtt-sources/${sourceId}/fields`, {
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
