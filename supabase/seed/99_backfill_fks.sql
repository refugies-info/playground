-- Backfill profiles.role and profiles.language from auth.users metadata.
-- The handle_new_user trigger no longer copies role/language (they are managed
-- by server actions). But seed data has role/language in raw_user_meta_data,
-- so we need to backfill profiles after all users are created.
UPDATE public.profiles p
SET
  role     = coalesce(p.role,     u.raw_user_meta_data->>'role'),
  language = coalesce(p.language, nullif(u.raw_user_meta_data->>'language', ''))
FROM auth.users u
WHERE p.id = u.id
  AND (p.role IS NULL OR p.language IS NULL);

-- Backfill circular FK references
-- These were set to NULL during initial insert to avoid FK violations.

-- Backfill ingestion_records.ingestion_report_id
UPDATE ingestion_records SET ingestion_report_id = '4582902b-94cd-425c-80ae-408334cf49bb' WHERE id = '131769a1-f80d-457d-80e4-58a0a57df15e';
UPDATE ingestion_records SET ingestion_report_id = '82ede78b-b97a-4580-bf36-c7243f0b304a' WHERE id = '1359b67d-0008-40f5-b011-f1ed64c177fe';
UPDATE ingestion_records SET ingestion_report_id = '55f3aa80-9363-4dcf-a7d9-6c42bd1e7618' WHERE id = '185c7a16-def7-4448-aabd-24f30b77df78';
UPDATE ingestion_records SET ingestion_report_id = '0fb57cb4-74ec-46cb-a13a-873ffb7007d3' WHERE id = '23801143-693d-43f9-8712-bd2b4c519c32';
UPDATE ingestion_records SET ingestion_report_id = 'cf9be80e-91fd-4bd8-98e4-988e4e25af57' WHERE id = '2598d2a2-6421-4de4-b7e3-4af4500ca8d4';
UPDATE ingestion_records SET ingestion_report_id = 'a8fc4e01-43a0-440d-8115-d6de4e5fbca9' WHERE id = '28909517-ba30-49c4-8470-0f705c851831';
UPDATE ingestion_records SET ingestion_report_id = '50a9f79b-9186-4972-99fe-d61ade21ce24' WHERE id = '39216948-93b4-4cf0-8db1-e797d0e3078a';
UPDATE ingestion_records SET ingestion_report_id = '470fd5a7-0987-44e0-b084-a36eebbdaf07' WHERE id = '3e91f40e-a915-4a96-a887-913236359066';
UPDATE ingestion_records SET ingestion_report_id = '65a33e3b-9652-43e9-b171-5dd981c1f7af' WHERE id = '3ecab6bf-c363-41d2-b4f7-e4f387e5f420';
UPDATE ingestion_records SET ingestion_report_id = '28e73be8-bc94-47a1-aa18-5190d1932f01' WHERE id = '4c6b9a8a-5ad8-4a8f-9ccf-6f3be424c773';
UPDATE ingestion_records SET ingestion_report_id = 'b4724527-5a3b-43cb-abe8-81a12e944ab3' WHERE id = '51ddd2c9-f774-4a3e-804b-5bda4ab6efd4';
UPDATE ingestion_records SET ingestion_report_id = 'ac1b4715-589f-40fc-a3b4-4783d3ed236d' WHERE id = '5676e468-63f0-4944-958b-ece04393803b';
UPDATE ingestion_records SET ingestion_report_id = 'f496fc58-0575-4e60-913a-4e198871b54f' WHERE id = '647c3976-8243-423b-98a2-61151a56994f';
UPDATE ingestion_records SET ingestion_report_id = '0524aca8-acec-4fe2-b1a4-77d231bf39dc' WHERE id = '64be85c4-0e9f-4578-aa75-d72b78353ee6';
UPDATE ingestion_records SET ingestion_report_id = '28d6a306-1ec7-4525-be4c-fb4622b63ab3' WHERE id = '6bdce5bd-1f0d-44fc-ba80-b39bb463f33e';
UPDATE ingestion_records SET ingestion_report_id = '485bc041-ad80-4f13-adce-e8b5b632975c' WHERE id = '6c7489e5-de43-4b6a-95b5-9ad6d40cc3db';
UPDATE ingestion_records SET ingestion_report_id = 'aec80dec-0cc9-4a7e-a119-531bec5cc477' WHERE id = '728bfb51-1b93-485e-8181-9068a4262d2d';
UPDATE ingestion_records SET ingestion_report_id = 'f0fc7756-6240-4efe-b8ae-412597c09337' WHERE id = 'c4c377a9-752b-4cb6-9acf-025afe51b4d2';
UPDATE ingestion_records SET ingestion_report_id = '91ee6a65-1b9b-4122-8074-4020d9dc39d5' WHERE id = 'c709b3a0-7956-42d4-990b-5f137e435035';
UPDATE ingestion_records SET ingestion_report_id = '3ab50c34-655c-4b50-b191-04808b1f8081' WHERE id = 'c85d2432-9257-456c-9f29-9efbb80a8389';
UPDATE ingestion_records SET ingestion_report_id = '5f3ae3e1-9fe7-4f73-a501-1398c54d8b79' WHERE id = 'dcf7b4f9-93f8-4955-8446-0da83ff7ba86';
UPDATE ingestion_records SET ingestion_report_id = '1b2a32ce-fd58-4095-ab33-909c3da83c84' WHERE id = 'e4e3a6c3-40a1-4026-b2c1-a602b5e4a00a';
UPDATE ingestion_records SET ingestion_report_id = '17b304fe-f3dd-417c-bd47-949d8d07192c' WHERE id = 'e5266641-084d-4ab5-a6e1-acb6b21c5a3d';
UPDATE ingestion_records SET ingestion_report_id = '9f1dd9c1-55f7-4b17-acdd-c898f742cd7d' WHERE id = 'e7eb67c9-d6de-488e-8def-4b74996d6fa7';
UPDATE ingestion_records SET ingestion_report_id = '3846bd60-2132-4277-ab35-da376fe85a40' WHERE id = 'f2539246-a6e0-4723-a7e6-ce0af0d49e2f';
UPDATE ingestion_records SET ingestion_report_id = 'ea65a775-0122-4991-802a-e12d1f2e9399' WHERE id = 'f28dd88e-4ad5-4ba0-80bc-b01396fd4a6f';
UPDATE ingestion_records SET ingestion_report_id = 'b8117907-bf7a-4762-9ddc-ac150f1a0142' WHERE id = 'f8023806-3d8c-49bd-a0ab-964e2df479f4';
UPDATE ingestion_records SET ingestion_report_id = 'b8611875-ecd7-4141-a08e-020f0846f998' WHERE id = 'fb5fc33c-00eb-478b-8889-f975edfb1624';
UPDATE ingestion_records SET ingestion_report_id = 'fcce9262-4423-49e7-8f2f-2362301c4886' WHERE id = 'fffeb72c-673a-494f-a3da-dec259c07e00';


-- Backfill workflows.editorial_record_id
UPDATE workflows SET editorial_record_id = 'c084aa80-83ad-4354-8d7e-5a68749c94ee' WHERE id = '9aa94d11-6b40-4504-ba99-38e951e652a4';
UPDATE workflows SET editorial_record_id = 'e86f4b2f-670c-4c1b-a2be-97ee9a7ad22f' WHERE id = '3aa0a9ec-32ce-4f18-9d65-b2816cd6cffa';
UPDATE workflows SET editorial_record_id = 'a8437368-c018-481c-959f-9fbc3661a2f5' WHERE id = 'f411d731-ba70-42d7-85da-e05dc79f951b';
UPDATE workflows SET editorial_record_id = '8a013f57-34f6-49fb-b929-1e1aba31536c' WHERE id = 'a1ca9718-325e-45fe-bc4c-3d2cdff29a1a';
UPDATE workflows SET editorial_record_id = 'abc82ce8-a10a-4e8a-a529-116ce026d26a' WHERE id = 'e173e735-552e-46a6-9b4b-a56521d43ce0';
UPDATE workflows SET editorial_record_id = '1b4fe5e4-baf8-40b9-b7b2-1b957f4ec920' WHERE id = 'd020a9f2-07e9-41d5-b9f4-ebaff6db5e10';
UPDATE workflows SET editorial_record_id = 'e3829880-d457-49d3-9d9d-88456f843a61' WHERE id = '09689ca9-1653-4ce7-8532-fe8cbf7f1b99';
UPDATE workflows SET editorial_record_id = 'c59742a1-54f3-4be7-ba0b-8ef52450c975' WHERE id = '26c0e650-0e85-4819-b64b-013f8a972dad';
UPDATE workflows SET editorial_record_id = '4871cf64-ee7f-4f25-b650-634fab9a0440' WHERE id = 'f4def384-fdce-44cd-840e-3fa936a02fc7';
UPDATE workflows SET editorial_record_id = '214e653f-718a-45e3-b8ff-6864de056b50' WHERE id = '18fc7d09-52ec-4b16-b732-2e5e5d37f0a1';

-- Backfill workflows.assignee_id (moved from editorial_records — RI-1340), keyed by editorial_record_id
UPDATE workflows SET assignee_id = '7cd263de-3991-4c49-86dc-d37fcfb371ea' WHERE editorial_record_id = 'e3829880-d457-49d3-9d9d-88456f843a61';
UPDATE workflows SET assignee_id = '7cd263de-3991-4c49-86dc-d37fcfb371ea' WHERE editorial_record_id = 'a8437368-c018-481c-959f-9fbc3661a2f5';
UPDATE workflows SET assignee_id = 'b1bb04e3-c07b-4e22-a7eb-fea7db0a2b1c' WHERE editorial_record_id = 'abc82ce8-a10a-4e8a-a529-116ce026d26a';
UPDATE workflows SET assignee_id = 'b1bb04e3-c07b-4e22-a7eb-fea7db0a2b1c' WHERE editorial_record_id = 'c59742a1-54f3-4be7-ba0b-8ef52450c975';
UPDATE workflows SET assignee_id = '7cd263de-3991-4c49-86dc-d37fcfb371ea' WHERE editorial_record_id = 'c084aa80-83ad-4354-8d7e-5a68749c94ee';
UPDATE workflows SET assignee_id = 'd6378d34-3386-41bf-9698-98a8ffea6871' WHERE editorial_record_id = '214e653f-718a-45e3-b8ff-6864de056b50';
UPDATE workflows SET assignee_id = '7cd263de-3991-4c49-86dc-d37fcfb371ea' WHERE editorial_record_id = 'e86f4b2f-670c-4c1b-a2be-97ee9a7ad22f';
UPDATE workflows SET assignee_id = 'e13d33b5-a7aa-4af4-b8e4-cfa559a62e6d' WHERE editorial_record_id = '4871cf64-ee7f-4f25-b650-634fab9a0440';
UPDATE workflows SET assignee_id = '7cd263de-3991-4c49-86dc-d37fcfb371ea' WHERE editorial_record_id = '1b4fe5e4-baf8-40b9-b7b2-1b957f4ec920';
UPDATE workflows SET assignee_id = 'e13d33b5-a7aa-4af4-b8e4-cfa559a62e6d' WHERE editorial_record_id = '8a013f57-34f6-49fb-b929-1e1aba31536c';
