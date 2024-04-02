/**
	This file should contain only deployment specific configuration.
*/

var configServiceDefFiles = {};

var configDefaultBranch = 'release_8';
/**
	The array below contains the list of loaded XML files.
	It should be configured appropriately in each MO Viewer instance.
	The files shall be listed in dependency order (i.e. MAL spec comes first).
*/
/* Release 8 (the latest) */
configServiceDefFiles.release_8 = [
  'https://raw.githubusercontent.com/ccsdsmo/xml-service-specifications/release-8/xml-ccsds-mo-standards/src/main/resources/xml/area001-v001-MAL.xml',
  'https://raw.githubusercontent.com/ccsdsmo/xml-service-specifications/release-8/xml-ccsds-mo-standards/src/main/resources/xml/area002-v001-COM.xml',
  'https://raw.githubusercontent.com/ccsdsmo/xml-service-specifications/release-8/xml-ccsds-mo-standards/src/main/resources/xml/area004-v001-Monitor-and-Control.xml',
  'https://raw.githubusercontent.com/ccsdsmo/xml-service-specifications/release-8/xml-ccsds-mo-standards/src/main/resources/xml/area003-v001-Common.xml',
];

/* Prototypes  / ongoing development */
configServiceDefFiles.prototypes = [
  'https://raw.githubusercontent.com/esa/mo-services-java/v10.1/xml-service-specifications/xml-ccsds-mo-prototypes/src/main/resources/xml/area001-v003-MAL.xml',
  'https://raw.githubusercontent.com/esa/mo-services-java/v10.1/xml-service-specifications/xml-ccsds-mo-prototypes/src/main/resources/xml/area004-v002-Monitor-and-Control.xml',
  'https://raw.githubusercontent.com/esa/mo-services-java/v10.1/xml-service-specifications/xml-ccsds-mo-prototypes/src/main/resources/xml/area005-v001-Mission-Planning-and-Scheduling.xml',
  'https://raw.githubusercontent.com/esa/mo-services-java/v10.1/xml-service-specifications/xml-ccsds-mo-prototypes/src/main/resources/xml/area009-v001-Mission-Product-Distribution.xml',
];

/* NMF Development branch */
configServiceDefFiles.nmf_dev = [
  'https://raw.githubusercontent.com/esa/nanosat-mo-framework/dev/core/mo-services-xml/src/main/resources/xml/ServiceDefMAL.xml',
  'https://raw.githubusercontent.com/esa/nanosat-mo-framework/dev/core/mo-services-xml/src/main/resources/xml/ServiceDefCOM-nmf.xml',
  'https://raw.githubusercontent.com/ccsdsmo/xml-service-specifications/release-8/xml-ccsds-mo-standards/src/main/resources/xml/area004-v001-Monitor-and-Control.xml',
  'https://raw.githubusercontent.com/ccsdsmo/xml-service-specifications/release-8/xml-ccsds-mo-standards/src/main/resources/xml/area003-v001-Common.xml',
  'https://raw.githubusercontent.com/esa/nanosat-mo-framework/dev/core/mo-services-xml/src/main/resources/xml/ServiceDefPLATFORM.xml',
  'https://raw.githubusercontent.com/esa/nanosat-mo-framework/dev/core/mo-services-xml/src/main/resources/xml/ServiceDefSM.xml',
  'https://raw.githubusercontent.com/esa/nanosat-mo-framework/dev/core/mo-services-xml/src/main/resources/xml/ServiceDefMP-nmf.xml',
];


var configServiceBookFiles = {
  'MAL': {pdfFilePath: 'pdf/ServiceDefMAL.xml-521x0b2e1.pdf', name: '521x0b2e1', icon: 'book'},
  'COM': {pdfFilePath: 'pdf/ServiceDefCOM.xml-521x1b1.pdf', name: '521x1b1', icon: 'book'},
  'Common': {pdfFilePath: 'pdf/ServiceDefCommon.xml-522x0r1.pdf', name: '522x0r1 (draft)', icon: 'book_red'},
  'MC': {pdfFilePath: 'pdf/ServiceDefMC.xml-522x1b1.pdf', name: '522x1b1', icon: 'book'},
};
