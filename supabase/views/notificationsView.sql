-- Create a secure notifications view scoped to the current authenticated user
CREATE OR REPLACE VIEW notifications_view AS
SELECT
  n.notification_id,
  n.user_id,
  n.sender_id,
  n.notification_datetime,
  n.notification_text,
  n.notification_type,
  n.notification_status,
  n.notification_metadata,
  
  -- Calculate how long ago the notification was created
  EXTRACT(EPOCH FROM (NOW() - n.notification_datetime)) / 60 AS minutes_ago,
  
  -- Include sender information if available
  sender.name AS sender_name,
  sender.handle AS sender_handle,
  
  -- For easier filtering
  CASE
    WHEN n.notification_status = 'unread' THEN TRUE
    ELSE FALSE
  END AS is_unread,
  
  -- Metadata for filtering/grouping
  EXTRACT(YEAR FROM n.notification_datetime) AS year,
  EXTRACT(MONTH FROM n.notification_datetime) AS month,
  EXTRACT(DAY FROM n.notification_datetime) AS day
  
FROM notifications n
LEFT JOIN users sender ON n.sender_id = sender.user_id
WHERE 
  -- Secure the view to only show notifications for the authenticated user
  n.user_id = auth.uid()
  -- Only show unread notifications
  AND n.notification_status = 'unread'
  
ORDER BY n.notification_datetime DESC;
