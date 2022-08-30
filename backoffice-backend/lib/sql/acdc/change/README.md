These are incremental change scripts for the database.

Folders with a name do_NNNNN_description are forward migrations.

Folders with a name undo_NNNNN_description are rollback migrations.

Folders with a name tmp_NNNNN_description are under development, and are pushed to allocate the change number NNNNN.

The full ../install/acdc2.sql script creates the schema and populates a database with an initial setup.
The table DbChange contains a list that are already applied on the acdc2.sql full script.

(The project manager should decide )