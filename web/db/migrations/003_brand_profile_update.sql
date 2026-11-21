-- Brand profile update (Nov 2026): agrifood industries, missing from the site.
-- Adds a 7th "What we do" card, a 5th "Tomorrow" strategic objective and the footer line
-- "A member of IPH Group" to the dashboard DRAFT only.
-- Nothing goes live until an editor reviews it and presses Publish (guardrails and history apply as usual).
-- Safe to re-run: each item is added only if absent. With no draft yet, the bundled seed already has both.
do $$
declare
  d jsonb;
  i int;
begin
  select content into d from cms_draft where id = 1 for update;
  if d is null then return; end if;

  select (ord - 1)::int into i
    from jsonb_array_elements(d->'sections') with ordinality e(v, ord) where v->>'id' = 'what-we-do';
  if i is not null and not exists (
    select 1 from jsonb_array_elements(d->'sections'->i->'items') x where x->>'icon' = 'agrifood'
  ) then
    d := jsonb_set(d, array['sections', i::text, 'items'], (d->'sections'->i->'items') || jsonb_build_array(jsonb_build_object(
      'icon', 'agrifood',
      'title', jsonb_build_object('en', 'Agrifood industries', 'ar', 'الصناعات الغذائية الزراعية'),
      'text', jsonb_build_object('en', 'Establishing agrifood industries based on agricultural products.',
                                 'ar', 'تأسيس صناعات غذائية قائمة على المنتجات الزراعية.')
    )));
  end if;

  i := null;
  select (ord - 1)::int into i
    from jsonb_array_elements(d->'sections') with ordinality e(v, ord) where v->>'id' = 'two-horizons';
  if i is not null and not exists (
    select 1 from jsonb_array_elements(d->'sections'->i->'tomorrow') x where x->'title'->>'en' = 'Agrifood processing'
  ) then
    d := jsonb_set(d, array['sections', i::text, 'tomorrow'], (d->'sections'->i->'tomorrow') || jsonb_build_array(jsonb_build_object(
      'title', jsonb_build_object('en', 'Agrifood processing', 'ar', 'التصنيع الغذائي'),
      'text', jsonb_build_object('en', 'Establish agrifood processing industries based on agricultural products.',
                                 'ar', 'تأسيس صناعات تحويلية غذائية قائمة على المنتجات الزراعية.')
    )));
  end if;

  -- Footer endorsement: "A member of IPH Group", shown. Arabic already entered in the dashboard is kept.
  d := jsonb_set(d, '{site,endorsement}', jsonb_build_object(
    'visible', true,
    'text', jsonb_build_object(
      'en', 'A member of IPH Group',
      'ar', coalesce(nullif(btrim(d #>> '{site,endorsement,text,ar}'), ''), 'عضو في مجموعة IPH')
    )
  ));

  update cms_draft set content = d, updated_at = now() where id = 1;
end $$;
