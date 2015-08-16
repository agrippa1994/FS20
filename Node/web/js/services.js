angular.module("services", [])

.factory("Notification", function() {
    return function(caption, content, style = "success", keepOpen = false) {
        $.Notify({ caption: caption, content: content, type: style, keepOpen: keepOpen });
    };
})

.factory("FS20", function($resource) {
    return {
        all: $resource("/api"),
        rooms: $resource("/api/house"),
        devices: function(roomID) {
            return $resource("/api/house/:roomID/device", { roomID: roomID });
        },
        
        setState: function(device, state) {
            return $resource("/api/house/:house_id/device/:device_id/:command", null, { getWithTimeout: { method: "GET", timeout: 1000  }}).getWithTimeout({
                    house_id: device.house_id,
                    device_id: device.id,
                    command: (state ? "enable" : "disable")
                }
            );
        }
    };
})
