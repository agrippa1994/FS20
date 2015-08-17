angular.module("services", [])

.factory("Notification", function() {
    return function(caption, content, style, keepOpen) {
        style = style || "success";
        keepOpen = keepOpen || false;
        
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
        },
        
        isValidFS20Code: function(code) {
            var c = parseInt(code);
            if(isNaN(c))
                return false;

            if(c < 1111 || c > 4444)
                return false;

            for(var i = 1; i <= 4; i++, c = Math.floor(c / 10))
                if(c % 10 < 1 || c % 10 > 4)
                    return false;

            return true;
        },
        
        convertFS20Code: function(code) {
            if(!fs20.isValidCode(code))
                return -1;

            for(var i = 1111, hex = 0x00; i<=4444; i++) {
                if(!fs20.isValidCode(i))
                    continue;

                if(code == i)
                    return hex;

                hex++;
            }
            return -1;
        }
    };
})
