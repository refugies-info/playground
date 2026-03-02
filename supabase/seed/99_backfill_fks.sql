-- Backfill circular FK references
-- These were set to NULL during initial insert to avoid FK violations.

-- Backfill ingestion_records.ingestion_report_id
UPDATE ingestion_records SET ingestion_report_id = '0524aca8-acec-4fe2-b1a4-77d231bf39dc' WHERE id = '64be85c4-0e9f-4578-aa75-d72b78353ee6';
UPDATE ingestion_records SET ingestion_report_id = '28d6a306-1ec7-4525-be4c-fb4622b63ab3' WHERE id = '6bdce5bd-1f0d-44fc-ba80-b39bb463f33e';
UPDATE ingestion_records SET ingestion_report_id = 'ac1b4715-589f-40fc-a3b4-4783d3ed236d' WHERE id = '5676e468-63f0-4944-958b-ece04393803b';
UPDATE ingestion_records SET ingestion_report_id = 'cf9be80e-91fd-4bd8-98e4-988e4e25af57' WHERE id = '2598d2a2-6421-4de4-b7e3-4af4500ca8d4';
UPDATE ingestion_records SET ingestion_report_id = 'f496fc58-0575-4e60-913a-4e198871b54f' WHERE id = '647c3976-8243-423b-98a2-61151a56994f';
UPDATE ingestion_records SET ingestion_report_id = '28e73be8-bc94-47a1-aa18-5190d1932f01' WHERE id = '4c6b9a8a-5ad8-4a8f-9ccf-6f3be424c773';
UPDATE ingestion_records SET ingestion_report_id = '4582902b-94cd-425c-80ae-408334cf49bb' WHERE id = '131769a1-f80d-457d-80e4-58a0a57df15e';
UPDATE ingestion_records SET ingestion_report_id = '17b304fe-f3dd-417c-bd47-949d8d07192c' WHERE id = 'e5266641-084d-4ab5-a6e1-acb6b21c5a3d';
UPDATE ingestion_records SET ingestion_report_id = 'b8611875-ecd7-4141-a08e-020f0846f998' WHERE id = 'fb5fc33c-00eb-478b-8889-f975edfb1624';
UPDATE ingestion_records SET ingestion_report_id = '485bc041-ad80-4f13-adce-e8b5b632975c' WHERE id = '6c7489e5-de43-4b6a-95b5-9ad6d40cc3db';
UPDATE ingestion_records SET ingestion_report_id = 'e4047d92-c441-45dd-b7c8-6ad214790f02' WHERE id = '7549bd3e-aff2-453e-8105-d79639a98b4a';

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
