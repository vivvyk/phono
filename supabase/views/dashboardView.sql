-- Secure version scoped to the current user only
CREATE OR REPLACE VIEW dashboard_view AS
SELECT
  u.user_id,
  u.name,
  u.role,
  u.balance,

  -- Friends list
    (
    SELECT json_agg(friend_data)
    FROM (
        SELECT u2.user_id, u2.name
        FROM friends f
        JOIN users u2 ON f.friend_id = u2.user_id
        WHERE f.user_id = u.user_id
        LIMIT 10
    ) AS friend_data
    ) AS friends,

  -- Transactions in the last day
  (
    SELECT json_agg(t_data)
    FROM (
      SELECT
        t.transaction_id,
        t.amount,
        -- Dynamically assign direction based on current user
        CASE
          WHEN t.origin_user_id = u.user_id THEN 'outbound'
          ELSE 'inbound'
        END AS direction,
        t.status,
        t.transaction_datetime,
        t.description,
        t.category,
        t.origin_user_id,
        t.destination_user_id,
        -- Determine counterparty relative to current user
        CASE
          WHEN t.origin_user_id = u.user_id THEN u2.name
          ELSE u1.name
        END AS counterparty_name,
        CASE
          WHEN t.origin_user_id = u.user_id THEN u2.handle
          ELSE u1.handle
        END AS counterparty_handle
      FROM transactions t
      LEFT JOIN users u1 ON t.origin_user_id = u1.user_id
      LEFT JOIN users u2 ON t.destination_user_id = u2.user_id
      WHERE
        (t.origin_user_id = u.user_id OR t.destination_user_id = u.user_id)
        AND t.transaction_datetime >= NOW() - INTERVAL '1 day'
        AND t.status = 'complete'
      ORDER BY t.transaction_datetime DESC
    ) AS t_data
  ) AS recent_transactions,


  -- Balance change (corrected logic: based on origin/destination user role)
  (
    SELECT COALESCE(SUM(
      CASE
        WHEN t.origin_user_id = u.user_id THEN -t.amount  -- money sent
        WHEN t.destination_user_id = u.user_id THEN t.amount  -- money received
        ELSE 0
      END
    ), 0)
    FROM transactions t
    WHERE
      (t.origin_user_id = u.user_id OR t.destination_user_id = u.user_id)
      AND t.transaction_datetime >= NOW() - INTERVAL '1 day'
      AND t.status != 'pending'
  ) AS balance_change_last_day,

  -- Notifications
  (
    SELECT COUNT(*)
    FROM notifications n
    WHERE n.user_id = u.user_id
      AND n.notification_status = 'unread'
      AND n.notification_datetime >= NOW() - INTERVAL '1 day'
  ) AS unread_notifications_count,

  (
    SELECT json_agg(n_data)
    FROM (
      SELECT
        n.notification_id,
        n.notification_datetime,
        n.notification_text,
        n.notification_type,
        n.notification_status
      FROM notifications n
      WHERE n.user_id = u.user_id
        AND n.notification_status = 'unread'
        AND n.notification_datetime >= NOW() - INTERVAL '1 day'
      ORDER BY n.notification_datetime DESC
    ) AS n_data
  ) AS unread_notifications

FROM users u
WHERE u.user_id = auth.uid();
