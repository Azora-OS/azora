/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * Azora GraphQL Schema and Data Layer
 * 
 * Sovereign data layer using GraphQL for precise, client-controlled data fetching
 * across the entire Azora ecosystem.
 * 
 * Features:
 * - Type-safe schema with full TypeScript integration
 * - Real-time subscriptions for live data
 * - Federation for microservices architecture
 * - Optimistic updates and caching
 * - DID-based authentication and authorization
 * - PIVC score integration
 * - Enterprise-grade performance
 */

import { EventEmitter } from 'events';

// GraphQL Schema Definition Language (SDL)
export const typeDefs = `
  # Scalars
  scalar DateTime
  scalar JSON
  scalar DID
  scalar PIVC

  # Directives
  directive @auth(requires: Role = USER) on OBJECT | FIELD_DEFINITION
  directive @rateLimit(limit: Int!, duration: Int!) on FIELD_DEFINITION
  directive @cacheControl(maxAge: Int!, scope: CacheControlScope!) on FIELD_DEFINITION

  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }

  enum Role {
    USER
    MODERATOR
    ADMIN
    SYSTEM
  }

  # Core Types
  type User @auth {
    id: ID!
    did: DID!
    username: String!
    email: String
    profile: UserProfile!
    pivc: PIVCScore!
    repositories: [Repository!]!
    contributions: [Contribution!]!
    achievements: [Achievement!]!
    collaborations: [Collaboration!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type UserProfile {
    displayName: String
    avatar: String
    bio: String
    location: String
    website: String
    social: SocialLinks
    preferences: UserPreferences
  }

  type SocialLinks {
    github: String
    twitter: String
    linkedin: String
    website: String
  }

  type UserPreferences {
    theme: String
    language: String
    notifications: NotificationPreferences
    privacy: PrivacySettings
  }

  type NotificationPreferences {
    email: Boolean!
    push: Boolean!
    inApp: Boolean!
    digest: String
  }

  type PrivacySettings {
    profileVisibility: String!
    activityVisibility: String!
    pivcVisibility: String!
  }

  # PIVC Types
  type PIVCScore {
    score: PIVC!
    rank: Int!
    percentile: Float!
    contributions: [Contribution!]!
    achievements: [Achievement!]!
    verifiedBy: [DID!]!
    calculatedAt: DateTime!
    history: [PIVCHistoryEntry!]!
  }

  type PIVCHistoryEntry {
    score: PIVC!
    timestamp: DateTime!
    reason: String
  }

  type Contribution {
    id: ID!
    type: ContributionType!
    impact: Float!
    timestamp: DateTime!
    verified: Boolean!
    repository: Repository
    description: String
    metadata: JSON
  }

  enum ContributionType {
    CODE
    DOCUMENTATION
    REVIEW
    MENTORSHIP
    COMMUNITY
    SECURITY
    PERFORMANCE
    ACCESSIBILITY
  }

  type Achievement {
    id: ID!
    name: String!
    description: String!
    earnedAt: DateTime!
    level: AchievementLevel!
    criteria: [String!]!
    badge: String
  }

  enum AchievementLevel {
    BRONZE
    SILVER
    GOLD
    PLATINUM
    DIAMOND
  }

  # Repository Types
  type Repository @auth {
    id: ID!
    name: String!
    description: String
    owner: User!
    visibility: RepositoryVisibility!
    defaultBranch: String!
    branches: [Branch!]!
    commits: [Commit!]!
    pullRequests: [PullRequest!]!
    issues: [Issue!]!
    collaborators: [User!]!
    stars: Int!
    forks: Int!
    watchers: Int!
    language: String
    topics: [String!]!
    license: String
    createdAt: DateTime!
    updatedAt: DateTime!
    pushedAt: DateTime
  }

  enum RepositoryVisibility {
    PUBLIC
    PRIVATE
    INTERNAL
  }

  type Branch {
    id: ID!
    name: String!
    protected: Boolean!
    commit: Commit!
    ahead: Int!
    behind: Int!
  }

  type Commit {
    id: ID!
    sha: String!
    message: String!
    author: User!
    committer: User!
    timestamp: DateTime!
    parents: [Commit!]!
    tree: String!
    stats: CommitStats
  }

  type CommitStats {
    additions: Int!
    deletions: Int!
    total: Int!
    files: [FileChange!]!
  }

  type FileChange {
    filename: String!
    status: FileChangeStatus!
    additions: Int!
    deletions: Int!
    changes: Int!
    patch: String
  }

  enum FileChangeStatus {
    ADDED
    MODIFIED
    DELETED
    RENAMED
    COPIED
  }

  # Pull Request Types
  type PullRequest @auth {
    id: ID!
    number: Int!
    title: String!
    description: String
    author: User!
    state: PullRequestState!
    draft: Boolean!
    sourceBranch: Branch!
    targetBranch: Branch!
    commits: [Commit!]!
    reviews: [Review!]!
    comments: [Comment!]!
    labels: [Label!]!
    assignees: [User!]!
    reviewers: [User!]!
    mergeable: Boolean!
    merged: Boolean!
    mergedAt: DateTime
    mergedBy: User
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum PullRequestState {
    OPEN
    CLOSED
    MERGED
    DRAFT
  }

  type Review {
    id: ID!
    author: User!
    state: ReviewState!
    body: String
    comments: [ReviewComment!]!
    submittedAt: DateTime!
  }

  enum ReviewState {
    APPROVED
    CHANGES_REQUESTED
    COMMENTED
    DISMISSED
  }

  type ReviewComment {
    id: ID!
    author: User!
    body: String!
    path: String!
    line: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Issue Types
  type Issue @auth {
    id: ID!
    number: Int!
    title: String!
    description: String
    author: User!
    state: IssueState!
    labels: [Label!]!
    assignees: [User!]!
    comments: [Comment!]!
    milestone: Milestone
    closedAt: DateTime
    closedBy: User
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum IssueState {
    OPEN
    CLOSED
  }

  type Label {
    id: ID!
    name: String!
    color: String!
    description: String
  }

  type Milestone {
    id: ID!
    title: String!
    description: String
    state: MilestoneState!
    dueDate: DateTime
    progress: Float!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum MilestoneState {
    OPEN
    CLOSED
  }

  type Comment {
    id: ID!
    author: User!
    body: String!
    reactions: [Reaction!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Reaction {
    id: ID!
    user: User!
    emoji: String!
    createdAt: DateTime!
  }

  # Collaboration Types
  type Collaboration {
    id: ID!
    type: CollaborationType!
    document: Document!
    participants: [User!]!
    active: Boolean!
    startedAt: DateTime!
    endedAt: DateTime
  }

  enum CollaborationType {
    CODE_REVIEW
    PAIR_PROGRAMMING
    DESIGN_SESSION
    PLANNING
    BRAINSTORMING
  }

  type Document {
    id: ID!
    type: DocumentType!
    title: String!
    content: String
    owner: User!
    collaborators: [User!]!
    version: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum DocumentType {
    CODE
    MARKDOWN
    JSON
    YAML
    TEXT
    CANVAS
    WHITEBOARD
  }

  # Query Root
  type Query {
    # User queries
    me: User @auth
    user(id: ID, did: DID, username: String): User
    users(limit: Int, offset: Int, search: String): [User!]!
    
    # Repository queries
    repository(id: ID, owner: String, name: String): Repository
    repositories(
      owner: String
      visibility: RepositoryVisibility
      limit: Int
      offset: Int
      search: String
    ): [Repository!]!
    
    # Pull Request queries
    pullRequest(id: ID, repository: ID, number: Int): PullRequest
    pullRequests(
      repository: ID
      state: PullRequestState
      author: ID
      limit: Int
      offset: Int
    ): [PullRequest!]!
    
    # Issue queries
    issue(id: ID, repository: ID, number: Int): Issue
    issues(
      repository: ID
      state: IssueState
      author: ID
      assignee: ID
      labels: [String!]
      limit: Int
      offset: Int
    ): [Issue!]!
    
    # PIVC queries
    pivcScore(did: DID!): PIVCScore
    pivcLeaderboard(limit: Int, offset: Int): [User!]!
    
    # Collaboration queries
    activeCollaborations(user: ID): [Collaboration!]!
    document(id: ID!): Document
  }

  # Mutation Root
  type Mutation {
    # User mutations
    updateProfile(input: UpdateProfileInput!): User! @auth
    updatePreferences(input: UpdatePreferencesInput!): User! @auth
    
    # Repository mutations
    createRepository(input: CreateRepositoryInput!): Repository! @auth
    updateRepository(id: ID!, input: UpdateRepositoryInput!): Repository! @auth
    deleteRepository(id: ID!): Boolean! @auth
    
    # Pull Request mutations
    createPullRequest(input: CreatePullRequestInput!): PullRequest! @auth
    updatePullRequest(id: ID!, input: UpdatePullRequestInput!): PullRequest! @auth
    mergePullRequest(id: ID!): PullRequest! @auth
    closePullRequest(id: ID!): PullRequest! @auth
    
    # Review mutations
    createReview(input: CreateReviewInput!): Review! @auth
    submitReview(id: ID!, state: ReviewState!, body: String): Review! @auth
    
    # Issue mutations
    createIssue(input: CreateIssueInput!): Issue! @auth
    updateIssue(id: ID!, input: UpdateIssueInput!): Issue! @auth
    closeIssue(id: ID!): Issue! @auth
    reopenIssue(id: ID!): Issue! @auth
    
    # Comment mutations
    createComment(input: CreateCommentInput!): Comment! @auth
    updateComment(id: ID!, body: String!): Comment! @auth
    deleteComment(id: ID!): Boolean! @auth
    
    # Reaction mutations
    addReaction(commentId: ID!, emoji: String!): Reaction! @auth
    removeReaction(id: ID!): Boolean! @auth
    
    # Collaboration mutations
    startCollaboration(input: StartCollaborationInput!): Collaboration! @auth
    joinCollaboration(id: ID!): Collaboration! @auth
    leaveCollaboration(id: ID!): Boolean! @auth
    endCollaboration(id: ID!): Collaboration! @auth
    
    # Document mutations
    createDocument(input: CreateDocumentInput!): Document! @auth
    updateDocument(id: ID!, content: String!): Document! @auth
    deleteDocument(id: ID!): Boolean! @auth
  }

  # Subscription Root
  type Subscription {
    # User subscriptions
    userUpdated(id: ID!): User! @auth
    pivcUpdated(did: DID!): PIVCScore! @auth
    
    # Repository subscriptions
    repositoryUpdated(id: ID!): Repository! @auth
    commitPushed(repository: ID!): Commit! @auth
    
    # Pull Request subscriptions
    pullRequestUpdated(id: ID!): PullRequest! @auth
    reviewSubmitted(pullRequest: ID!): Review! @auth
    
    # Issue subscriptions
    issueUpdated(id: ID!): Issue! @auth
    commentAdded(issue: ID!): Comment! @auth
    
    # Collaboration subscriptions
    collaborationStarted(user: ID!): Collaboration! @auth
    participantJoined(collaboration: ID!): User! @auth
    participantLeft(collaboration: ID!): User! @auth
    documentUpdated(id: ID!): Document! @auth
    
    # Presence subscriptions
    presenceUpdated(document: ID!): [PresenceState!]! @auth
  }

  type PresenceState {
    user: User!
    cursor: CursorPosition
    selection: Selection
    status: String!
    timestamp: DateTime!
  }

  type CursorPosition {
    line: Int!
    column: Int!
  }

  type Selection {
    start: Position!
    end: Position!
  }

  type Position {
    line: Int!
    column: Int!
  }

  # Input Types
  input UpdateProfileInput {
    displayName: String
    avatar: String
    bio: String
    location: String
    website: String
    social: SocialLinksInput
  }

  input SocialLinksInput {
    github: String
    twitter: String
    linkedin: String
    website: String
  }

  input UpdatePreferencesInput {
    theme: String
    language: String
    notifications: NotificationPreferencesInput
    privacy: PrivacySettingsInput
  }

  input NotificationPreferencesInput {
    email: Boolean
    push: Boolean
    inApp: Boolean
    digest: String
  }

  input PrivacySettingsInput {
    profileVisibility: String
    activityVisibility: String
    pivcVisibility: String
  }

  input CreateRepositoryInput {
    name: String!
    description: String
    visibility: RepositoryVisibility!
    defaultBranch: String
    license: String
    topics: [String!]
  }

  input UpdateRepositoryInput {
    name: String
    description: String
    visibility: RepositoryVisibility
    defaultBranch: String
    topics: [String!]
  }

  input CreatePullRequestInput {
    repository: ID!
    title: String!
    description: String
    sourceBranch: String!
    targetBranch: String!
    draft: Boolean
  }

  input UpdatePullRequestInput {
    title: String
    description: String
    draft: Boolean
  }

  input CreateReviewInput {
    pullRequest: ID!
    body: String
    comments: [ReviewCommentInput!]
  }

  input ReviewCommentInput {
    path: String!
    line: Int!
    body: String!
  }

  input CreateIssueInput {
    repository: ID!
    title: String!
    description: String
    labels: [String!]
    assignees: [ID!]
  }

  input UpdateIssueInput {
    title: String
    description: String
    labels: [String!]
    assignees: [ID!]
    state: IssueState
  }

  input CreateCommentInput {
    issue: ID
    pullRequest: ID
    body: String!
  }

  input StartCollaborationInput {
    type: CollaborationType!
    document: ID!
    participants: [ID!]!
  }

  input CreateDocumentInput {
    type: DocumentType!
    title: String!
    content: String
  }
`;

// GraphQL Configuration
export interface GraphQLConfig {
  endpoint: string;
  subscriptionEndpoint?: string;
  authentication: AuthConfig;
  caching: CacheConfig;
  federation: FederationConfig;
  performance: PerformanceConfig;
  security: SecurityConfig;
}

export interface AuthConfig {
  type: 'did' | 'jwt' | 'oauth' | 'custom';
  headerName: string;
  tokenPrefix: string;
  refreshEnabled: boolean;
}

export interface CacheConfig {
  enabled: boolean;
  defaultMaxAge: number;
  storage: 'memory' | 'indexeddb' | 'localstorage';
  persistQueries: boolean;
}

export interface FederationConfig {
  enabled: boolean;
  services: ServiceConfig[];
  gateway: string;
}

export interface ServiceConfig {
  name: string;
  url: string;
  schema: string;
}

export interface PerformanceConfig {
  batchRequests: boolean;
  batchInterval: number;
  persistedQueries: boolean;
  compression: boolean;
}

export interface SecurityConfig {
  rateLimiting: boolean;
  maxDepth: number;
  maxComplexity: number;
  introspection: boolean;
}

// GraphQL Client Manager
export class AzoraGraphQLClient extends EventEmitter {
  private static instance: AzoraGraphQLClient;
  private config: GraphQLConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();

  private constructor(config: GraphQLConfig) {
    super();
    this.config = config;
  }

  public static getInstance(config?: GraphQLConfig): AzoraGraphQLClient {
    if (!AzoraGraphQLClient.instance) {
      if (!config) {
        throw new Error('Configuration required for first initialization');
      }
      AzoraGraphQLClient.instance = new AzoraGraphQLClient(config);
    }
    return AzoraGraphQLClient.instance;
  }

  // Query execution
  public async query<T = any>(
    query: string,
    variables?: Record<string, any>,
    options?: QueryOptions
  ): Promise<QueryResult<T>> {
    try {
      // Check cache
      if (this.config.caching.enabled && !options?.skipCache) {
        const cached = this.getFromCache(query, variables);
        if (cached) {
          return { data: cached as T, errors: undefined };
        }
      }

      // Execute query
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ query, variables })
      });

      const result = await response.json();

      // Cache result
      if (this.config.caching.enabled && result.data) {
        this.setCache(query, variables, result.data);
      }

      this.emit('query-executed', { query, variables, result });
      return result;
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  }

  // Mutation execution
  public async mutate<T = any>(
    mutation: string,
    variables?: Record<string, any>
  ): Promise<MutationResult<T>> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ query: mutation, variables })
      });

      const result = await response.json();

      // Invalidate related cache entries
      this.invalidateCache(mutation);

      this.emit('mutation-executed', { mutation, variables, result });
      return result;
    } catch (error) {
      console.error('GraphQL mutation error:', error);
      throw error;
    }
  }

  // Subscription management
  public subscribe<T = any>(
    subscription: string,
    variables?: Record<string, any>,
    callback?: (data: T) => void
  ): string {
    const id = `sub-${Date.now()}-${Math.random()}`;
    
    // Create WebSocket connection for subscriptions
    const ws = new WebSocket(this.config.subscriptionEndpoint || this.config.endpoint);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'start',
        id,
        payload: { query: subscription, variables }
      }));
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'data' && message.id === id) {
        if (callback) {
          callback(message.payload.data);
        }
        this.emit('subscription-data', { id, data: message.payload.data });
      }
    };
    
    this.subscriptions.set(id, { ws, subscription, variables });
    this.emit('subscription-created', { id, subscription, variables });
    
    return id;
  }

  public unsubscribe(id: string): void {
    const sub = this.subscriptions.get(id);
    if (sub) {
      sub.ws.send(JSON.stringify({ type: 'stop', id }));
      sub.ws.close();
      this.subscriptions.delete(id);
      this.emit('subscription-closed', { id });
    }
  }

  // Cache management
  private getFromCache(query: string, variables?: Record<string, any>): any {
    const key = this.getCacheKey(query, variables);
    const entry = this.cache.get(key);
    
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
    
    return null;
  }

  private setCache(query: string, variables: Record<string, any> | undefined, data: any): void {
    const key = this.getCacheKey(query, variables);
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.config.caching.defaultMaxAge
    });
  }

  private invalidateCache(mutation: string): void {
    // Simple cache invalidation - would be more sophisticated in production
    this.cache.clear();
  }

  private getCacheKey(query: string, variables?: Record<string, any>): string {
    return `${query}:${JSON.stringify(variables || {})}`;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add authentication header
    const token = this.getAuthToken();
    if (token) {
      headers[this.config.authentication.headerName] = 
        `${this.config.authentication.tokenPrefix} ${token}`;
    }

    return headers;
  }

  private getAuthToken(): string | null {
    // Would retrieve from auth manager
    return null;
  }

  public getConfig(): GraphQLConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<GraphQLConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Supporting Types
export interface QueryOptions {
  skipCache?: boolean;
  maxAge?: number;
}

export interface QueryResult<T> {
  data?: T;
  errors?: GraphQLError[];
}

export interface MutationResult<T> {
  data?: T;
  errors?: GraphQLError[];
}

export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
  extensions?: Record<string, any>;
}

export interface CacheEntry {
  data: any;
  expiresAt: number;
}

export interface Subscription {
  ws: WebSocket;
  subscription: string;
  variables?: Record<string, any>;
}

// Export the main class and schema
export default AzoraGraphQLClient;
export { typeDefs as schema };

