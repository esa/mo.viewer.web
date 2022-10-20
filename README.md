# MOWebViewer
A HTML/JS viewer for CCSDS MO Services

Visit the [website](https://esa.github.io/mo.viewer.web/) to browse the services.


## How to run and configure locally
### Prerequisites
* Python
* Git
### Steps
```
# Clone the git repository
git clone https://github.com/esa/mo.viewer.web
# Navigate to the cloned repo
cd mo.viewer.web
# Start a local HTTP server
python -m http.server
# Use your favourite browser to navigate to the page, e.g.
firefox http://localhost:8000/ &
```

### Configuration
You can edit the configuration file to quickly visualise local books.
E.g. if you are prototyping a new MO Area XML `NewMOArea.xml`, you can copy or symlink it to the directory of the Viewer, and insert the following to the `config.js`:
```
configServiceDefFiles.new_mo_area = [
  'https://raw.githubusercontent.com/ccsdsmo/xml-service-specifications/release-8/xml-ccsds-mo-standards/src/main/resources/xml/area001-v001-MAL.xml',
  'https://raw.githubusercontent.com/ccsdsmo/xml-service-specifications/release-8/xml-ccsds-mo-standards/src/main/resources/xml/area002-v001-COM.xml',
  '/NewMOArea.xml',
];
```