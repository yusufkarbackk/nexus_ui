const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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
// Handles session expiry by clearing storage and redirecting to login
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });

  // Handle session expiry - clear storage and redirect
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_user');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  }

  return response;
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

export type DestinationType = 'database' | 'rest' | 'sap';
export type WorkflowType = 'fan_out' | 'sequential';
export type StepType = 'rest_call' | 'db_query' | 'transform' | 'condition' | 'delay';
export type StepErrorHandling = 'stop' | 'skip' | 'retry';

// Sequential workflow step field mapping
export interface StepFieldMappingPayload {
  sourceField: string;
  destinationColumn: string;
  dataType?: string;
  transformType?: string;
  transformParam?: string;
  defaultValue?: string;
  nullHandling?: string;
}

export interface StepFieldMapping {
  id: number;
  stepId: number;
  sourceField: string;
  destinationColumn: string;
  dataType?: string;
  transformType?: string;
  transformParam?: string;
  defaultValue?: string;
  nullHandling?: string;
  createdAt: string;
}

// Sequential workflow step payload (for create/update)
export interface WorkflowStepPayload {
  stepOrder: number;
  stepName: string;
  stepType: StepType;
  // REST call config
  restDestinationId?: number;
  restMethod?: string;
  restPath?: string;
  restBodyTemplate?: string;
  // DB query config
  databaseConfigId?: number;
  dbQueryType?: string;
  dbTargetTable?: string;
  dbPrimaryKey?: string;
  dbExtendedQuery?: string;
  // Transform config
  transformExpression?: string;
  // Condition config
  conditionExpression?: string;
  onTrueStep?: number;
  onFalseStep?: number;
  // Delay config
  delaySeconds?: number;
  // Common config
  inputMapping?: string;
  outputVariable?: string;
  onError: StepErrorHandling;
  maxRetries: number;
  timeoutSeconds: number;
  isActive: boolean;
  fieldMappings: StepFieldMappingPayload[];
}

// Sequential workflow step (from API response)
export interface WorkflowStep {
  id: number;
  workflowId: number;
  stepOrder: number;
  stepName: string;
  stepType: StepType;
  // REST call config
  restDestinationId?: number;
  restMethod?: string;
  restPath?: string;
  restBodyTemplate?: string;
  // DB query config
  databaseConfigId?: number;
  dbQueryType?: string;
  dbTargetTable?: string;
  dbPrimaryKey?: string;
  dbExtendedQuery?: string;
  // Transform config
  transformExpression?: string;
  // Condition config
  conditionExpression?: string;
  onTrueStep?: number;
  onFalseStep?: number;
  // Delay config
  delaySeconds?: number;
  // Common config
  inputMapping?: string;
  outputVariable?: string;
  onError: StepErrorHandling;
  maxRetries: number;
  timeoutSeconds: number;
  isActive: boolean;
  fieldMappings: StepFieldMapping[];
  // Expanded references
  restDestination?: RestDestination;
  destination?: Destination;
  createdAt: string;
  updatedAt: string;
}

export interface PipelinePayload {
  // Source configuration
  sourceType: 'sender_app' | 'mqtt_source';
  applicationId?: number;  // For sender_app sources
  mqttSourceId?: number;   // For mqtt_source sources
  // Destination configuration  
  destinationType: DestinationType;
  // For database destinations
  destinationId?: number;
  targetTable?: string;
  dbQueryType?: 'select' | 'insert' | 'upsert' | 'update' | 'delete';  // Database operation type
  dbPrimaryKey?: string;  // Primary key for UPDATE/DELETE/UPSERT
  // For REST destinations
  restDestinationId?: number;
  // For SAP destinations
  sapDestinationId?: number;
  sapQuery?: string;
  sapQueryType?: string;
  sapTargetSchema?: string;
  sapPrimaryKey?: string;
  isActive: boolean;
  fieldMappings: FieldMappingPayload[];
}

export interface CreateWorkflowPayload {
  name: string;
  description?: string;
  isActive: boolean;
  redisRetentionHours?: number;
  deleteFailedImmediately?: boolean;
  workflowType?: WorkflowType;
  pipelines?: PipelinePayload[];       // For fan_out workflows
  steps?: WorkflowStepPayload[];       // For sequential workflows
}

export interface UpdateWorkflowPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
  redisRetentionHours?: number;
  deleteFailedImmediately?: boolean;
  workflowType?: WorkflowType;
  pipelines?: PipelinePayload[];       // For fan_out workflows
  steps?: WorkflowStepPayload[];       // For sequential workflows
}

export interface FieldMapping {
  id: number;
  pipelineId: number;
  sourceField: string;
  destinationColumn: string;
  dataType?: string;
  transformType?: string;
  transformParam?: string;
  defaultValue?: string;
  nullHandling?: string;
  createdAt: string;
}

// SAP Pipeline Config from backend
export interface SapPipelineConfig {
  id: number;
  pipelineId: number;
  sapDestinationId: number;
  queryType: string;
  sqlQuery: string;
  targetSchema?: string;
  targetTable?: string;
  primaryKeyColumn?: string;
  paramMapping?: string;
}

export interface Pipeline {
  id: number;
  workflowId: number;
  // Source type and IDs
  sourceType?: 'sender_app' | 'mqtt_source';
  applicationId?: number;
  mqttSourceId?: number;
  // Destination info
  destinationType: DestinationType;
  // For database destinations
  destinationId?: number;
  targetTable?: string;
  dbQueryType?: string;  // Database operation type: select, insert, upsert, update, delete
  dbPrimaryKey?: string;  // Primary key for UPDATE/DELETE/UPSERT operations
  destination?: Destination;
  // For REST destinations
  restDestinationId?: number;
  restDestination?: RestDestination;
  // For SAP destinations
  sapDestinationId?: number;
  sapDestination?: SapDestination;
  sapPipelineConfig?: SapPipelineConfig;
  isActive: boolean;
  fieldMappings: FieldMapping[];
  application?: Application;
  mqttSource?: MQTTSource;
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
  workflowType?: WorkflowType;
  pipelines: Pipeline[];
  steps?: WorkflowStep[];
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

// Execute / trigger workflow manually
export async function executeWorkflow(id: number, payload?: Record<string, unknown>): Promise<{
  message: string;
  message_id: string;
  workflow_id: number;
  workflow_name: string;
  workflow_type: string;
  stream: string;
}> {
  const response = await authFetch(`${API_BASE_URL}/api/workflows/${id}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payload: payload || {} }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// ============================================
// REST Destination API Functions
// ============================================

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type AuthType = 'none' | 'bearer' | 'api_key' | 'basic';

// MQTT Source types used in Pipeline
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
  brokerUrl: string;
  encryptionEnabled: boolean;
  fields?: MQTTSourceField[];
}

export interface RestDestinationBodyField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  required: boolean;
  description: string;
}

export interface RestDestination {
  id: number;
  name: string;
  description: string | null;
  baseUrl: string;
  method: HTTPMethod;
  headers: string | null;  // JSON string
  bodyFields: RestDestinationBodyField[] | null;
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
  bodyFields?: RestDestinationBodyField[];
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
  bodyFields?: RestDestinationBodyField[];
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

// ====================
// Agent API
// ====================

export interface Agent {
  id: number;
  name: string;
  token: string;
  description: string | null;
  agentType: string;  // "", "sender", "receiver", "query"
  status: 'active' | 'inactive' | 'revoked';
  lastSeenAt: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
  apps?: AgentApp[];
  appCount?: number;
}

export interface AgentApp {
  id: number;
  name: string;
  appKey: string;
  assignedAt: string;
}

export interface AgentListResponse {
  success: boolean;
  message: string;
  data: Agent[];
  total: number;
}

export interface CreateAgentPayload {
  name: string;
  description?: string;
  agent_type?: string;  // "sender", "receiver", "query"
}

export interface UpdateAgentPayload {
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'revoked';
}

// Fetch all agents
export async function fetchAgents(): Promise<AgentListResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/agents`, {
    method: 'GET',
  });
  return response.json();
}

// Create a new agent
export async function createAgent(payload: CreateAgentPayload): Promise<ApiResponse<Agent>> {
  const response = await authFetch(`${API_BASE_URL}/api/agents`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
}

// Update an agent
export async function updateAgent(id: number, payload: UpdateAgentPayload): Promise<ApiResponse<Agent>> {
  const response = await authFetch(`${API_BASE_URL}/api/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return response.json();
}

// Delete an agent
export async function deleteAgent(id: number): Promise<ApiResponse<void>> {
  const response = await authFetch(`${API_BASE_URL}/api/agents/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

// Get agent by ID with apps
export async function fetchAgentById(id: number): Promise<ApiResponse<Agent>> {
  const response = await authFetch(`${API_BASE_URL}/api/agents/${id}`, {
    method: 'GET',
  });
  return response.json();
}

// Assign app to agent
export async function assignAppToAgent(agentId: number, applicationId: number): Promise<ApiResponse<void>> {
  const response = await authFetch(`${API_BASE_URL}/api/agents/${agentId}/apps`, {
    method: 'POST',
    body: JSON.stringify({ application_id: applicationId }),
  });
  return response.json();
}

// Unassign app from agent
export async function unassignAppFromAgent(agentId: number, applicationId: number): Promise<ApiResponse<void>> {
  const response = await authFetch(`${API_BASE_URL}/api/agents/${agentId}/apps/${applicationId}`, {
    method: 'DELETE',
  });
  return response.json();
}

// Get apps assigned to agent
export async function fetchAgentApps(agentId: number): Promise<{ success: boolean; data: AgentApp[] }> {
  const response = await authFetch(`${API_BASE_URL}/api/agents/${agentId}/apps`, {
    method: 'GET',
  });
  return response.json();
}

// ============================================
// SAP Destination API Functions
// ============================================

export type SapDestinationStatus = 'active' | 'inactive';

export interface SapDestination {
  id: number;
  name: string;
  description: string | null;
  dsn_name: string;
  username: string;
  timeout_seconds: number;
  max_rows: number;
  status: SapDestinationStatus;
  created_at: string;
  updated_at: string;
}

export interface SapDestinationListResponse {
  success: boolean;
  message: string;
  data: SapDestination[];
  total: number;
}

// Fetch all SAP destinations
export async function fetchSapDestinations(): Promise<SapDestinationListResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/sap-destinations`, {
    method: 'GET',
  });
  return response.json();
}

// Fetch single SAP destination by ID
export async function fetchSapDestinationById(id: number): Promise<ApiResponse<SapDestination>> {
  const response = await authFetch(`${API_BASE_URL}/api/sap-destinations/${id}`, {
    method: 'GET',
  });
  return response.json();
}

// ============================================
// SAP Metadata API Functions (for Edge Config)
// ============================================

export interface SapSchema {
  name: string;
}

export interface SapTable {
  name: string;
  type: string;
}

export interface SapColumn {
  name: string;
  dataType: string;
  length?: number;
  scale?: number;
  isNullable: boolean;
  defaultValue?: string;
}

// Fetch schemas from SAP destination
// NOTE: These use relative URLs because they are Next.js internal API routes,
// NOT Nexus Core endpoints. The internal routes then call Nexus Core.
export async function fetchSapSchemas(destinationId: number): Promise<{ success: boolean; schemas: SapSchema[]; error?: string }> {
  const response = await authFetch(`/api/sap-destinations/${destinationId}/schemas`, {
    method: 'GET',
  });
  return response.json();
}

// Fetch tables for a schema from SAP destination
export async function fetchSapTables(destinationId: number, schemaName: string): Promise<{ success: boolean; tables: SapTable[]; error?: string }> {
  const response = await authFetch(`/api/sap-destinations/${destinationId}/tables?schema=${encodeURIComponent(schemaName)}`, {
    method: 'GET',
  });
  return response.json();
}

// Fetch columns for a table from SAP destination
export async function fetchSapColumns(destinationId: number, schemaName: string, tableName: string): Promise<{ success: boolean; columns: SapColumn[]; error?: string }> {
  const response = await authFetch(`/api/sap-destinations/${destinationId}/columns?schema=${encodeURIComponent(schemaName)}&table=${encodeURIComponent(tableName)}`, {
    method: 'GET',
  });
  return response.json();
}
