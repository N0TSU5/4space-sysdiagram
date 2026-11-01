## Problem statement

Traditional public health planning relies heavily on static, retrospective census figures that fail to capture real-time population mobility, transient workers and dynamic street-level activity. Healthcare commissioners therefore struggle to deploy preventative services, such as mobile health screening vans, to the right locations at the exact times when vulnerable populations are physically present.

## Project Snow

Across the Thames Freeport region (Barking & Dagenham, Havering and Thurrock), cardiovascular and diabetes risks are concentrated among highly mobile and unregistered populations. Project Snow requires an operational digital twin that predicts optimal mobile health van deployment locations by processing billions of mobile location pings, while strictly complying with UK GDPR and NHS clinical safety standards (DCB0129/DCB0160).

## Terrabite raw data

The raw mobility feed consists of high-volume GPS location pings delivered as TSV files into an isolated Google Cloud Storage bucket (`raw@datalake4us`). Each reading includes raw advertising identifiers (`device_id`), UTC timestamps, WGS84 latitude and longitude, horizontal accuracy metrics and network attributes across millions of UK devices.

## Privacy and security limits

Under UK GDPR and NHS data governance, raw personal movement traces and persistent device IDs can never cross into FourthSpace's application servers or be stored centrally.

The platform must enforce in-line PII de-identification and a mandatory k-anonymity **Floor of 5**. Any spatial or temporal aggregate representing fewer than 5 distinct panel devices is suppressed before data reaches any user-facing layer.

## Using this diagram

- Click a module or a box with a **+** to expand it and read its details.
- Click an arrow or its label to read about that connection.
- Click the header of an open box to collapse it.
- Tick a box's checkbox to mark it done. Ticking a parent ticks everything inside it.
- Use the **Progress** tab for the full spreadsheet of owners, statuses and notes.
- Drag to pan and scroll to zoom.
- The panel footer names the Markdown file that holds the text you are reading.
