-- USERS
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT,
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ACCOUNTS
CREATE TABLE accounts (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    bank_id UUID REFERENCES banks(bank_id),
    clabe TEXT UNIQUE NOT NULL
);

-- BANKS
CREATE TABLE banks (
    bank_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);

-- FRIENDS (bidirectional, symmetric)
CREATE TABLE friends (
    user_id UUID REFERENCES users(user_id),
    friend_id UUID REFERENCES users(user_id),
    friended_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, friend_id),
    CHECK (user_id <> friend_id)
);

-- TRANSACTIONS
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_user_id UUID REFERENCES users(user_id),
    destination_user_id UUID REFERENCES users(user_id),
    origin_clabe TEXT,
    destination_clabe TEXT,
    amount NUMERIC,
    currency TEXT,
    transaction_datetime TIMESTAMP DEFAULT NOW(),
    description TEXT,
    category TEXT,
    request BOOLEAN DEFAULT FALSE,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    status TEXT CHECK (status IN ('pending', 'rejected', 'complete'))
);

-- FRIEND REQUESTS (unidirectional, pending or rejected/accepted)
CREATE TABLE friend_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(user_id),
    receiver_id UUID REFERENCES users(user_id),
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP
);


-- NOTIFICATIONS
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),  -- recipient of the notification
    sender_id UUID REFERENCES users(user_id),         -- optional sender
    notification_datetime TIMESTAMP DEFAULT NOW(),
    notification_text TEXT,
    notification_type TEXT,
    notification_status TEXT CHECK (notification_status IN ('unread', 'read')) DEFAULT 'unread',
    notification_metadata JSONB                       -- optional structured metadata
);

