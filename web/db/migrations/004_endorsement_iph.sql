-- Footer endorsement: "A member of IPH Group" becomes "A member of IPH", in the dashboard DRAFT only.
-- It goes live when an editor presses Publish. Wording an editor has already changed is left alone.
-- Safe to re-run. With no draft yet, the bundled seed already has the new wording.
update cms_draft
  set content = jsonb_set(content, '{site,endorsement,text,en}', '"A member of IPH"'), updated_at = now()
  where id = 1 and content #>> '{site,endorsement,text,en}' = 'A member of IPH Group';

update cms_draft
  set content = jsonb_set(content, '{site,endorsement,text,ar}', '"عضو في IPH"'), updated_at = now()
  where id = 1 and content #>> '{site,endorsement,text,ar}' = 'عضو في مجموعة IPH';
