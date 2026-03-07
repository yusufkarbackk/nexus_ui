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
  rateLimitValue: number;  // 0 = no limit
  rateLimitUnit: 'second' | 'minute';
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
  rateLimitValue?: number;
  rateLimitUnit?: 'second' | 'minute';
  fields?: ApplicationFieldPayload[];
}

export interface UpdateApplicationPayload {
  name?: string;
  description?: string;
  rateLimitValue?: number;
  rateLimitUnit?: 'second' | 'minute';
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
// Rate Limit API Functions
// ============================================

export interface GlobalRateLimitConfig {
  id: number;
  limitValue: number;        // 0 = no limit
  limitUnit: 'second' | 'minute';
  updatedAt: string;
}

export interface GlobalRateLimitResponse {
  success: boolean;
  message: string;
  data?: GlobalRateLimitConfig;
}

// Fetch global rate limit config
export async function fetchGlobalRateLimit(): Promise<GlobalRateLimitResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/rate-limit`, {
    method: 'GET',
  });
  return response.json();
}

// Update global rate limit config
export async function updateGlobalRateLimit(
  limitValue: number,
  limitUnit: 'second' | 'minute'
): Promise<GlobalRateLimitResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/rate-limit`, {
    method: 'PUT',
    body: JSON.stringify({ limitValue, limitUnit }),
  });
  return response.json();
}

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

export type DestinationType = 'database' | 'rest' | 'sap' | 'sequential';
export type WorkflowType = 'fan_out' | 'sequential';
export type StepType = 'rest_call' | 'db_query' | 'sap_query' | 'transform' | 'condition' | 'delay' | 'redis_command' | 'ai_agent';
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
  restHeadersTemplate?: string;
  // DB query config
  databaseConfigId?: number;
  dbQueryType?: string;
  dbTargetTable?: string;
  dbPrimaryKey?: string;
  dbExtendedQuery?: string;
  // SAP query config
  sapDestinationId?: number;
  sapQueryType?: string;
  sapSqlQuery?: string;
  // Transform config
  transformExpression?: string;
  // Condition config
  conditionExpression?: string;
  onTrueStep?: number;
  onFalseStep?: number;
  // Delay config
  delaySeconds?: number;
  // Redis command config
  redisDestinationId?: number;
  redisCommand?: string;
  redisKey?: string;
  redisField?: string;
  redisValue?: string;
  redisTTL?: number;
  // Common config
  inputMapping?: string;
  outputVariable?: string;
  onError: StepErrorHandling;
  maxRetries: number;
  timeoutSeconds: number;
  isActive: boolean;
  fieldMappings: StepFieldMappingPayload[];
  // AI Agent Object reference
  aiAgentId?: number;
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
  restHeadersTemplate?: string;
  // DB query config
  databaseConfigId?: number;
  dbQueryType?: string;
  dbTargetTable?: string;
  dbPrimaryKey?: string;
  dbExtendedQuery?: string;
  // SAP query config
  sapDestinationId?: number;
  sapQueryType?: string;
  sapSqlQuery?: string;
  // Transform config
  transformExpression?: string;
  // Condition config
  conditionExpression?: string;
  onTrueStep?: number;
  onFalseStep?: number;
  // Delay config
  delaySeconds?: number;
  // Redis command config
  redisDestinationId?: number;
  redisCommand?: string;
  redisKey?: string;
  redisField?: string;
  redisValue?: string;
  redisTTL?: number;
  // Common config
  inputMapping?: string;
  outputVariable?: string;
  onError: StepErrorHandling;
  maxRetries: number;
  timeoutSeconds: number;
  isActive: boolean;
  fieldMappings: StepFieldMapping[];
  // AI Agent Object reference
  aiAgentId?: number;
  // Expanded references
  restDestination?: RestDestination;
  destination?: Destination;
  sapDestination?: SapDestination;
  redisDestination?: RedisDestination;
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
  // For sequential workflow destinations
  sequentialWorkflowId?: number;
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
  rateLimitValue?: number;
  rateLimitUnit?: 'second' | 'minute';
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
  rateLimitValue?: number;
  rateLimitUnit?: 'second' | 'minute';
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
  // For sequential workflow destinations
  sequentialWorkflowId?: number;
  sequentialWorkflow?: { id: number; name: string; description?: string; isActive: boolean };
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
  webhookToken?: string;
  rateLimitValue: number;  // 0 = no limit
  rateLimitUnit: 'second' | 'minute';
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
  bodyTemplate: string | null;  // JSON template for nested body structure
  authType: AuthType;
  timeoutSeconds: number;
  skipTlsVerify: boolean;
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
  bodyTemplate?: string;
  authType: AuthType;
  authConfig?: string;  // JSON string with auth details
  timeoutSeconds?: number;
  skipTlsVerify?: boolean;
}

export interface UpdateRestDestinationPayload {
  name?: string;
  description?: string;
  baseUrl?: string;
  method?: HTTPMethod;
  headers?: string;
  bodyFields?: RestDestinationBodyField[];
  bodyTemplate?: string;
  authType?: AuthType;
  authConfig?: string;
  timeoutSeconds?: number;
  skipTlsVerify?: boolean;
  status?: 'up' | 'down';
}

export interface TestRestConnectionPayload {
  baseUrl: string;
  method: HTTPMethod;
  headers?: string;
  authType: AuthType;
  authConfig?: string;
  timeoutSeconds?: number;
  skipTlsVerify?: boolean;
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

// ============================================
// Redis Destination API Functions
// ============================================

export type RedisDestinationStatus = 'up' | 'down';

export interface RedisDestination {
  id: number;
  name: string;
  description: string | null;
  host: string;
  port: number;
  databaseNumber: number;
  useTls: boolean;
  status: RedisDestinationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RedisDestinationListResponse {
  success: boolean;
  message: string;
  data: RedisDestination[];
  total: number;
}

export interface CreateRedisDestinationPayload {
  name: string;
  description?: string;
  host: string;
  port?: number;
  password?: string;
  databaseNumber?: number;
  useTls?: boolean;
}

export interface UpdateRedisDestinationPayload {
  name?: string;
  description?: string;
  host?: string;
  port?: number;
  password?: string;
  databaseNumber?: number;
  useTls?: boolean;
  status?: RedisDestinationStatus;
}

export interface TestRedisConnectionPayload {
  host: string;
  port?: number;
  password?: string;
  databaseNumber?: number;
  useTls?: boolean;
}

// Fetch all Redis destinations
export async function fetchRedisDestinations(): Promise<RedisDestinationListResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/redis-destinations`, {
    method: 'GET',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

// Fetch single Redis destination by ID
export async function fetchRedisDestinationById(id: number): Promise<ApiResponse<RedisDestination>> {
  const response = await authFetch(`${API_BASE_URL}/api/redis-destinations/${id}`, {
    method: 'GET',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

// Create Redis destination
export async function createRedisDestination(payload: CreateRedisDestinationPayload): Promise<ApiResponse<RedisDestination>> {
  const response = await authFetch(`${API_BASE_URL}/api/redis-destinations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
  return data;
}

// Update Redis destination
export async function updateRedisDestination(id: number, payload: UpdateRedisDestinationPayload): Promise<ApiResponse<RedisDestination>> {
  const response = await authFetch(`${API_BASE_URL}/api/redis-destinations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
  return data;
}

// Delete Redis destination
export async function deleteRedisDestination(id: number): Promise<ApiResponse<null>> {
  const response = await authFetch(`${API_BASE_URL}/api/redis-destinations/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
  return data;
}

// Test Redis connection
export async function testRedisConnection(payload: TestRedisConnectionPayload): Promise<{ success: boolean; message: string; latency?: string }> {
  const response = await authFetch(`${API_BASE_URL}/api/redis-destinations/test`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
}

// Toggle Redis destination status
export async function toggleRedisDestinationStatus(id: number): Promise<{ success: boolean; message: string; status: RedisDestinationStatus }> {
  const response = await authFetch(`${API_BASE_URL}/api/redis-destinations/${id}/toggle`, {
    method: 'POST',
  });
  return response.json();
}

// ============================================
// AI Provider API Functions
// ============================================

export type AIProviderType = 'gemini' | 'openai' | 'mcp' | 'custom_api';
export type AIProviderStatus = 'active' | 'inactive';

export interface AIProvider {
  id: number;
  name: string;
  description?: string;
  providerType: AIProviderType;
  baseUrl?: string;
  defaultModel?: string;
  timeoutSeconds: number;
  maxTokens: number;
  status: AIProviderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AIProviderListResponse {
  success: boolean;
  message: string;
  data: AIProvider[];
  total: number;
}

export interface CreateAIProviderPayload {
  name: string;
  description?: string;
  providerType: AIProviderType;
  baseUrl?: string;
  apiKey?: string;
  defaultModel?: string;
  timeoutSeconds?: number;
  maxTokens?: number;
}

// Fetch all AI providers
export async function fetchAIProviders(): Promise<AIProviderListResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/ai-providers`);
  return response.json();
}

// Create AI provider
export async function createAIProvider(payload: CreateAIProviderPayload): Promise<ApiResponse<AIProvider>> {
  const response = await authFetch(`${API_BASE_URL}/api/ai-providers`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
  return data;
}

// Update AI provider
export async function updateAIProvider(id: number, payload: Partial<CreateAIProviderPayload> & { status?: AIProviderStatus }): Promise<ApiResponse<AIProvider>> {
  const response = await authFetch(`${API_BASE_URL}/api/ai-providers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
  return data;
}

// Delete AI provider
export async function deleteAIProvider(id: number): Promise<ApiResponse<null>> {
  const response = await authFetch(`${API_BASE_URL}/api/ai-providers/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
  return data;
}

// Toggle AI provider status
export async function toggleAIProviderStatus(id: number): Promise<ApiResponse<AIProvider>> {
  const response = await authFetch(`${API_BASE_URL}/api/ai-providers/${id}/toggle`, {
    method: 'POST',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
  return data;
}

// Test AI provider connection
export async function testAIProviderConnection(payload: { providerType: string; baseUrl?: string; apiKey?: string; model?: string }): Promise<ApiResponse<null>> {
  const response = await authFetch(`${API_BASE_URL}/api/ai-providers/test`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.json();
}

// ============================================
// AI Agent API Functions
// ============================================

export interface AIAgentTool {
  id: number;
  agentId: number;
  toolName: string;
  toolDescription: string;
  parametersSchema?: string;
  toolType: string;
  restDestinationId?: number;
  restMethod?: string;
  restPath?: string;
  restBodyTemplate?: string;
  restHeaders?: string;
  databaseConfigId?: number;
  dbQuery?: string;
  redisDestinationId?: number;
  redisCommand?: string;
  redisKeyTemplate?: string;
  workflowId?: number;
  isActive: boolean;
  createdAt: string;
}

export interface AIAgent {
  id: number;
  name: string;
  description?: string;
  aiProviderId: number;
  model?: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  maxIterations: number;
  memoryEnabled: boolean;
  memoryType: string;
  memoryTtl: number;
  memoryMaxMessages: number;
  outputType: string;
  outputSchema?: string;
  isActive: boolean;
  providerName?: string;
  tools?: AIAgentTool[];
  createdAt: string;
  updatedAt: string;
}

export interface AIAgentListResponse {
  success: boolean;
  message: string;
  data: AIAgent[];
  total: number;
}

export interface AIAgentResponse {
  success: boolean;
  message: string;
  data?: AIAgent;
}

export interface CreateAIAgentPayload {
  name: string;
  description?: string;
  aiProviderId: number;
  model?: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  maxIterations?: number;
  memoryEnabled?: boolean;
  memoryType?: string;
  memoryTtl?: number;
  memoryMaxMessages?: number;
  outputType?: string;
  outputSchema?: string;
}

export interface CreateAIAgentToolPayload {
  toolName: string;
  toolDescription: string;
  parametersSchema?: string;
  toolType: string;
  restDestinationId?: number;
  restMethod?: string;
  restPath?: string;
  restBodyTemplate?: string;
  restHeaders?: string;
  databaseConfigId?: number;
  dbQuery?: string;
  redisDestinationId?: number;
  redisCommand?: string;
  redisKeyTemplate?: string;
  workflowId?: number;
}

// Fetch all AI agents
export async function fetchAIAgents(): Promise<AIAgentListResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/ai-agents`);
  return response.json();
}

// Fetch single AI agent by ID
export async function fetchAIAgentById(id: number): Promise<AIAgentResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/ai-agents/${id}`);
  return response.json();
}

// Create AI agent
export async function createAIAgent(payload: CreateAIAgentPayload): Promise<AIAgentResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/ai-agents`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
  return data;
}

// Update AI agent
export async function updateAIAgent(id: number, payload: Partial<CreateAIAgentPayload> & { isActive?: boolean }): Promise<AIAgentResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/ai-agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
  return data;
}

// Delete AI agent
export async function deleteAIAgent(id: number): Promise<AIAgentResponse> {
  const response = await authFetch(`${API_BASE_URL}/api/ai-agents/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
  return data;
}

// Add tool to AI agent
export async function addAIAgentTool(agentId: number, payload: CreateAIAgentToolPayload): Promise<ApiResponse<AIAgentTool>> {
  const response = await authFetch(`${API_BASE_URL}/api/ai-agents/${agentId}/tools`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
  return data;
}

// Delete tool from AI agent
export async function deleteAIAgentTool(agentId: number, toolId: number): Promise<ApiResponse<null>> {
  const response = await authFetch(`${API_BASE_URL}/api/ai-agents/${agentId}/tools/${toolId}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
  return data;
}
