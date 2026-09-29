-- 0030_specification_definitions_seed.sql
-- This is the spec-field catalogue per product type — real configuration
-- required for the admin product editor to render correctly, not sample/
-- test data. Values are added here; individual product rows with actual
-- specs are NOT (that would be product data, kept out of migrations).

insert into specification_definitions (product_type, key, label, data_type, unit, display_order) values
  -- Laptop
  ('laptop', 'processor', 'Processor', 'text', null, 1),
  ('laptop', 'processor_generation', 'Processor Generation', 'text', null, 2),
  ('laptop', 'ram', 'RAM', 'number', 'GB', 3),
  ('laptop', 'storage', 'Storage', 'number', 'GB', 4),
  ('laptop', 'storage_type', 'Storage Type', 'enum', null, 5),
  ('laptop', 'display_size', 'Display Size', 'number', 'in', 6),
  ('laptop', 'display_resolution', 'Display Resolution', 'text', null, 7),
  ('laptop', 'graphics', 'Graphics', 'text', null, 8),
  ('laptop', 'operating_system', 'Operating System', 'text', null, 9),
  ('laptop', 'battery', 'Battery', 'text', null, 10),
  ('laptop', 'keyboard', 'Keyboard', 'text', null, 11),
  ('laptop', 'ports', 'Ports', 'text', null, 12),
  ('laptop', 'wifi', 'Wi-Fi', 'text', null, 13),
  ('laptop', 'bluetooth', 'Bluetooth', 'text', null, 14),
  ('laptop', 'webcam', 'Webcam', 'text', null, 15),
  ('laptop', 'colour', 'Colour', 'text', null, 16),
  ('laptop', 'weight', 'Weight', 'number', 'kg', 17),

  -- Phone
  ('phone', 'brand', 'Brand', 'text', null, 1),
  ('phone', 'model', 'Model', 'text', null, 2),
  ('phone', 'storage', 'Storage', 'number', 'GB', 3),
  ('phone', 'ram', 'RAM', 'number', 'GB', 4),
  ('phone', 'display', 'Display', 'text', null, 5),
  ('phone', 'camera', 'Camera', 'text', null, 6),
  ('phone', 'battery', 'Battery', 'text', null, 7),
  ('phone', 'operating_system', 'Operating System', 'text', null, 8),
  ('phone', 'network', 'Network', 'text', null, 9),
  ('phone', 'sim', 'SIM', 'text', null, 10),

  -- Printer
  ('printer', 'print_type', 'Print Type', 'text', null, 1),
  ('printer', 'print_speed', 'Print Speed', 'text', null, 2),
  ('printer', 'resolution', 'Resolution', 'text', null, 3),
  ('printer', 'paper_size', 'Paper Size', 'text', null, 4),
  ('printer', 'connectivity', 'Connectivity', 'text', null, 5),
  ('printer', 'duplex', 'Duplex', 'boolean', null, 6),
  ('printer', 'scanner', 'Scanner', 'boolean', null, 7),
  ('printer', 'copy', 'Copy', 'boolean', null, 8),
  ('printer', 'fax', 'Fax', 'boolean', null, 9),

  -- Monitor
  ('monitor', 'screen_size', 'Screen Size', 'number', 'in', 1),
  ('monitor', 'resolution', 'Resolution', 'text', null, 2),
  ('monitor', 'panel_type', 'Panel Type', 'text', null, 3),
  ('monitor', 'refresh_rate', 'Refresh Rate', 'number', 'Hz', 4),
  ('monitor', 'response_time', 'Response Time', 'number', 'ms', 5),
  ('monitor', 'ports', 'Ports', 'text', null, 6),
  ('monitor', 'adaptive_sync', 'Adaptive Sync', 'text', null, 7)

  -- Shared conditions/warranty/colour live on the `products` table itself
  -- (condition, warranty_text) rather than as a spec row per type, since
  -- they apply identically across every product_type.
;
