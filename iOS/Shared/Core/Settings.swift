//
//  Settings.swift
//  FS20
//
//  Created by Manuel Stampfl on 24.09.15.
//  Copyright © 2015 Mani. All rights reserved.
//

import Foundation

// Name of application shared container
private let UserDefaultsIdentifier = "group.FS20"

class Settings {
    
    // Reads a setting from the user defaults from iOS
    private class func readKey<T>(key: String, def: T) -> T {
        guard let defaults = NSUserDefaults(suiteName: UserDefaultsIdentifier) where defaults.objectForKey(key) is T else {
            NSLog("NSUserDefaults couldn't be constructed!")
            return def
        }
        
        return defaults.objectForKey(key) as! T
    }
    
    // Host
    class var host: String {
        return readKey("Host", def: "")
    }
    
}
