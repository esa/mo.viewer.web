# MOWebViewer
A HTML/JS viewer for CCSDS MO Services

Visit the [website](https://esa.github.io/mo.viewer.web/) to browse the services.


## How to run and configure locally
### Prerequisites
* Python
### Steps

The following steps assume use of standard linux tools, but same can be achieved in Windows.
```
# Download and unpack the repository
# Alternatively clone using: git clone https://github.com/esa/mo.viewer.web
wget -O moviewer.zip https://github.com/esa/mo.viewer.web/archive/refs/heads/master.zip
unzip moviewer.zip
# Navigate to the cloned repo
cd mo.viewer.web-master
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