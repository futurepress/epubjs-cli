const CONTAINER_TEMPLATE = `<?xml version="1.0" encoding="UTF-8" ?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="{{ opsPath }}" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`;

export default CONTAINER_TEMPLATE;