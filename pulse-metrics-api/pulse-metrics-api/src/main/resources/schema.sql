-- 1. Organizations Table (Multi-Tenancy)
CREATE TABLE organizations (
                               id BIGSERIAL PRIMARY KEY,
                               name VARCHAR(100) NOT NULL,
                               slug VARCHAR(100) UNIQUE NOT NULL,
                               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
                       email VARCHAR(150) UNIQUE NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(100) NOT NULL,
                       role VARCHAR(50) DEFAULT 'ROLE_USER' NOT NULL,
                       is_active BOOLEAN DEFAULT TRUE,
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX idx_users_org_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- 3. Subscriptions Table
CREATE TABLE subscriptions (
                               id BIGSERIAL PRIMARY KEY,
                               organization_id BIGINT UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
                               plan_name VARCHAR(50) NOT NULL, -- FREE, PRO, ENTERPRISE
                               stripe_customer_id VARCHAR(100),
                               stripe_subscription_id VARCHAR(100),
                               status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, PAST_DUE, CANCELLED
                               monthly_quota INT NOT NULL DEFAULT 1000,
                               current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
                               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. API Usage Logs (Metrics & Rate Limiting)
CREATE TABLE api_usage_logs (
                                id BIGSERIAL PRIMARY KEY,
                                organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
                                endpoint VARCHAR(255) NOT NULL,
                                status_code INT NOT NULL,
                                response_time_ms BIGINT NOT NULL,
                                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_org_created ON api_usage_logs(organization_id, created_at);