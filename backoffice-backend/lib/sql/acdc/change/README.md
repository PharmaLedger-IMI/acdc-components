These are incremental change scripts for the database.

Folders with a name do_NNNNN_description are forward migrations.

Folders with a name undo_NNNNN_description are rollback migrations.

Folders with a name tmp_NNNNN_description are under development, and are pushed to allocate the change number NNNNN.

The NNNNN number provides the desired order of application.

All do|undo|tmp_NNNNN_description/scripts.sql should be transactional.

To manually apply a do_NNNNN_description/run.sql, just execute the run.sql
script within the folder as working directory, with DB user acdc.
If more than one script per folder exists, there should be a README.md
explaining the migration procedure.

The full ../install/acdc2.sql script creates the schema and populates a database with an initial setup.
(The table DbChange should contains a list that are already applied on the acdc2.sql full script.
But it does not exist yet. It is ok, as long as each script updates the acdc.version resources, and
fails/rollback if applied twice. )

