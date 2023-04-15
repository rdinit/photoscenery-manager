tiles = []
detailed_tiles = []
show_overlay()
var map = L.map('map').setView({ lon: 0, lat: 0 }, 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);
L.control.scale().addTo(map);

function get_tile_width(lat) {
    // thanks for https://github.com/nathanielwarner/flightgear-photoscenery
    if (lat >= 89.0) { return 12.0; }
    else if (lat >= 86.0) { return 4.0 }
    else if (lat >= 83.0) { return 2.0 }
    else if (lat >= 76.0) { return 1.0; }
    else if (lat >= 62.0) { return 0.5; }
    else if (lat >= 22.0) { return 0.25; }
    else if (lat >= -22.0) { return 0.125; }
    else if (lat >= -62.0) { return 0.25; }
    else if (lat >= -76.0) { return 0.5; }
    else if (lat >= -83.0) { return 1.0; }
    else if (lat >= -86.0) { return 2.0; }
    else if (lat >= -89.0) { return 4.0; }
    else { return 12.0 };
}
function draw_tile(d_lat, d_lon) {
    // thanks for https://github.com/nathanielwarner/flightgear-photoscenery
    d_lat = d_lat.toFixed(4)
    d_lon = d_lon.toFixed(4)
    lat = Math.floor(d_lat)
    width = get_tile_width(lat)
    lon = Math.floor(Math.floor(d_lon / width) * width)
    if (lon < -180) {
        lon = -180
    }
    x = Math.floor(Math.floor((d_lon - lon) / width))
    y = Math.floor((d_lat - lat) * 8)

    min_lat = lat + 0.125 * y
    max_lat = lat + 0.125 * (y + 1)
    min_lon = lon + x * width
    max_lon = lon + (x + 1) * width
    bounds = [[min_lat, min_lon], [max_lat, max_lon]];
    sbounds = bounds.toString()
    if (!detailed_tiles.find(function (ele) { return [ele[0], ele[1]].toString() === sbounds; })) {
        if (!tiles.find(function (ele) { return [ele[0], ele[1]].toString() === sbounds; })) {
            tiles.push([bounds[0], bounds[1], [d_lat, d_lon], L.rectangle(bounds, { color: "#ff7800", weight: 1 }).addTo(map).on('mouseover', onHover)])
        } else {
            detailed_tiles.push([bounds[0], bounds[1], [d_lat, d_lon], L.rectangle(bounds, { color: "#0f78ff", weight: 1 }).addTo(map).on('mouseover', onHover)])
            tiles = remove_tile(tiles, bounds)
        }
    } else {
        detailed_tiles = remove_tile(detailed_tiles, bounds)
    }
}
function remove_tile(arr, x) {
    return arr.filter(function (item) {
        if ((item[0][0] == x[0][0]) & (item[0][1] == x[0][1])) {
            map.removeLayer(item[3]);
            console.log(item[3])
            return false
        } else {
            return true
        }
    })
}
function onHover(e) {
    //console.log(this);
}
function show_overlay() {
    document.getElementById('overlay').style.visibility = 'visible'
}
function hide_overlay() {
    document.getElementById('overlay').style.visibility = 'collapse'
}
function generate_codes() {
    scenery_path = document.getElementById('scnery-folder').value
    cmds = []
    for (tile_n in tiles) {
        tile = tiles[tile_n]
        cmds.push("python creator.py --scenery_folder " + scenery_path + " --lat " + tile[2][0] + " --lon " + tile[2][1])
    }
    for (tile_n in detailed_tiles) {
        tile = tiles[tile_n]
        cmds.push("python creator.py --scenery_folder " + scenery_path + " --lat " + tile[2][0] + " --lon " + tile[2][1] + " --cols 2")
    }
    document.getElementById('output-text').value = cmds.join('\n')
    text = "python creator.py --scenery_folder " + scenery_path + " --lat " + lat + " --lon " + lon
}

function to_clipboard() {
    var copyText = document.getElementById("output-text");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
}
map.on('click', function (e) {
    draw_tile(e.latlng.lat, e.latlng.lng)
})

window.addEventListener('keydown', function (e) {
    e.key
}, false);