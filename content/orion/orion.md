Orion runs strictly as an **ephemeral data processing worker** inside Terrabite's secure GCP project.

Raw personal movement traces and persistent device IDs stay inside this boundary. Only non-linkable Gold Parquet tables that pass the privacy gate are published out to Merlin.
