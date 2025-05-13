DROP VIEW IF EXISTS transactions_view;

CREATE VIEW transactions_view AS
SELECT
  t.transaction_id,
  t.origin_user_id,
  t.destination_user_id,
  t.amount,
  t.currency,
  t.transaction_datetime,
  t.description,
  t.category,
  t.request,

  -- Direction based on the current user's perspective
  CASE
    WHEN t.origin_user_id = auth.uid() THEN 'outbound'
    WHEN t.destination_user_id = auth.uid() THEN 'inbound'
  END AS direction,

  t.status,

  -- Counterparty info relative to the current user
  CASE
    WHEN t.origin_user_id = auth.uid() THEN dest_user.name
    WHEN t.destination_user_id = auth.uid() THEN orig_user.name
    ELSE NULL
  END AS counterparty_name,

  CASE
    WHEN t.origin_user_id = auth.uid() THEN dest_user.handle
    WHEN t.destination_user_id = auth.uid() THEN orig_user.handle
    ELSE NULL
  END AS counterparty_handle,

  -- Payment method info
  t.origin_clabe,
  t.destination_clabe,

  -- Time metadata
  EXTRACT(YEAR FROM t.transaction_datetime) AS year,
  EXTRACT(MONTH FROM t.transaction_datetime) AS month,
  EXTRACT(DAY FROM t.transaction_datetime) AS day

FROM transactions t
LEFT JOIN users orig_user ON t.origin_user_id = orig_user.user_id
LEFT JOIN users dest_user ON t.destination_user_id = dest_user.user_id
WHERE 
  (t.origin_user_id = auth.uid() OR t.destination_user_id = auth.uid())
  AND t.status = 'complete'
ORDER BY t.transaction_datetime DESC;
