//
//  HouseEntry.swift
//  FS20
//
//  Created by Mani on 26.01.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import Foundation
import CoreData

@objc(HouseEntry)
class HouseEntry: NSManagedObject {

    @NSManaged var hc1: NSNumber
    @NSManaged var hc2: NSNumber
    @NSManaged var name: String
    @NSManaged var host: String
    @NSManaged var devices: NSSet

}
