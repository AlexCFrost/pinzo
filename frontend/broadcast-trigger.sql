-- Create a function to broadcast bookmark changes
CREATE OR REPLACE FUNCTION broadcast_bookmark_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM realtime.send(
      jsonb_build_object(
        'type', 'INSERT',
        'record', row_to_json(NEW)
      ),
      'bookmark_changes',
      'bookmarks',
      false
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM realtime.send(
      jsonb_build_object(
        'type', 'DELETE',
        'old_record', jsonb_build_object('id', OLD.id)
      ),
      'bookmark_changes',
      'bookmarks',
      false
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM realtime.send(
      jsonb_build_object(
        'type', 'UPDATE',
        'record', row_to_json(NEW)
      ),
      'bookmark_changes',
      'bookmarks',
      false
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on bookmarks table
DROP TRIGGER IF EXISTS bookmarks_broadcast_trigger ON bookmarks;
CREATE TRIGGER bookmarks_broadcast_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookmarks
  FOR EACH ROW EXECUTE FUNCTION broadcast_bookmark_changes();
