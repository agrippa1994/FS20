//
//  String+Localization.swift
//  FS20
//
//  Created by Manuel Stampfl on 27.07.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import Foundation

extension String {
    var localized: String {
        return NSLocalizedString(self, comment: self)
    }
}