create or replace view friends_view as
select *
from (
  -- Confirmed Friends (symmetric)
  select
    u1.user_id as current_user_id,
    u2.user_id as other_user_id,
    u2.name,
    u2.handle,
    'friend' as relationship_type,
    f.friended_at,
    null::uuid as request_id  -- no request_id for confirmed friends
  from friends f
  join users u1 on u1.user_id = f.user_id
  join users u2 on u2.user_id = f.friend_id

  union

  select
    u2.user_id as current_user_id,
    u1.user_id as other_user_id,
    u1.name,
    u1.handle,
    'friend' as relationship_type,
    f.friended_at,
    null::uuid as request_id
  from friends f
  join users u1 on u1.user_id = f.user_id
  join users u2 on u2.user_id = f.friend_id

  union

  -- Pending Requests (inbound only)
  select
    fr.receiver_id as current_user_id,
    fr.sender_id as other_user_id,
    u.name,
    u.handle,
    'pending' as relationship_type,
    fr.requested_at as friended_at,
    fr.request_id
  from friend_requests fr
  join users u on u.user_id = fr.sender_id
  where fr.status = 'pending'
) as combined
where current_user_id = auth.uid();
