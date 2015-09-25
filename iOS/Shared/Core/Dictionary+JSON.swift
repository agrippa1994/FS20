//
//  Dictionary+JSON.swift
//  FS20
//
//  Created by Manuel Stampfl on 27.07.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import Foundation

extension Dictionary {
    func cast<T>(key: Key, def: T) -> T {
        if let val = self[key] as? T {
            return val
        }
        
        return def
    }
}