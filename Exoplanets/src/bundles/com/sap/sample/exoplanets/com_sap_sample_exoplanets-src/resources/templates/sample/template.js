var sampleTemplate = 
{
    "id": "sample",
    "name": "Sample",
    "properties": {
        "com.sap.sample.exoplanets": {
            "legend": {
                "title": {
                    "visible": true,
                    "text": "City/Year"
                }
            }
        }
    },
    "css": ".viz-title-label.v-title {fill: #000fff}"
};
sap.viz.extapi.env.Template.register(sampleTemplate);