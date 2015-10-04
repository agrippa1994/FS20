//
//  Dictionary+JSON.swift
//  FS20
//
//  Created by Manuel Stampfl on 27.07.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import Foundation

enum DictionaryCastError: ErrorType {
    case TypeError(message: String)
}

extension Dictionary {
    func cast<T>(key: Key) throws -> T {
        if let val = self[key] as? T {
            return val
        }
        
        throw DictionaryCastError.TypeError(message: "Key \(key) doesn't conform to type \(T.self)")
    }
}