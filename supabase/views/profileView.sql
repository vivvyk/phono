-- PROFILE VIEW scoped to current authenticated user
CREATE OR REPLACE VIEW profile_view AS
SELECT
  u.user_id,
  u.name,
  u.role,
  u.city,
  u.balance,

  -- Recent Transactions (limit 3)
  (
    SELECT json_agg(t_data)
    FROM (
      SELECT
        t.transaction_id,
        t.amount,
        CASE
          WHEN t.origin_user_id = u.user_id THEN 'outbound'
          ELSE 'inbound'
        END AS direction,
        t.status,
        t.transaction_datetime,
        t.description,
        CASE
          WHEN t.origin_user_id = u.user_id THEN u2.name
          ELSE u1.name
        END AS counterparty_name
      FROM transactions t
      LEFT JOIN users u1 ON t.origin_user_id = u1.user_id
      LEFT JOIN users u2 ON t.destination_user_id = u2.user_id
      WHERE t.origin_user_id = u.user_id OR t.destination_user_id = u.user_id
      ORDER BY t.transaction_datetime DESC
      LIMIT 3
    ) AS t_data
  ) AS recent_transactions,

  -- Friends
  (
    SELECT json_agg(friend_data)
    FROM (
      SELECT u2.user_id, u2.name
      FROM friends f
      JOIN users u2 ON f.friend_id = u2.user_id
      WHERE f.user_id = u.user_id
      LIMIT 10
    ) AS friend_data
  ) AS friends

FROM users u
WHERE u.user_id = auth.uid();
