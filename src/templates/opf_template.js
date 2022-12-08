const OPF_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" xml:lang="{{ inLanguage | default: "en-US" }}" unique-identifier="pub-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <meta property="dcterms:modified">{{ dateModified }}</meta>
    <dc:identifier id="pub-id">{{ id }}</dc:identifier>
    <dc:language>{{ inLanguage | default: "en-US" }}</dc:language>
    {% if rights %}
    <dc:rights>{{ rights }}</dc:rights>
    {% endif %}
    {% if creator %}
    <dc:creator>{{ creator }}</dc:creator>
    {% endif %}
    {% for creator in creators %}
    <dc:contributor>{{ creator.name }}</dc:contributor>
    {% endfor %}
    {% for contrib in contributor %}
    <dc:contributor>{{ contrib }}</dc:contributor>
    {% endfor %}
    {% if title %}
    <dc:title>{{ title }}</dc:title>
    {% endif %}
    {% if name %}
    <dc:title>{{ name }}</dc:title>
    {% endif %}
    {% if source %}
    <dc:source>{{ source }}</dc:source>
    {% endif %}
    {% if subject %}
    <dc:subject>{{ subject }}</dc:subject>
    {% endif %}
    {% if description %}
    <dc:description>{{ description | escape_once }}</dc:description>
    {% endif %}
  </metadata>
  <manifest>
    {% for item in manifest %}
    {% if item.properties.length > 0 %}
    <item id="{{ item.id }}" href="{{ item.url }}" media-type="{{ item.encoding }}" properties="{{ item.properties | join: " " }}" />
    {% else %}
    <item id="{{ item.id }}" href="{{ item.url }}" media-type="{{ item.encoding }}" />
    {% endif %}
    {% endfor %}
  </manifest>
  <spine>
    {% if cover %}
    <itemref idref="{{ cover.id }}" linear="no"/>
    {% endif %}
    {% if nav %}
    <itemref idref="{{ nav.id }}" linear="no"/>
    {% endif %}
    {% for item in sections %}
    <itemref linear="yes" idref="{{ item.id }}"/>
    {% endfor %}
  </spine>
</package>
`;

export default OPF_TEMPLATE;