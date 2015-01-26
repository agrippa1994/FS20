//
//  CoreData.swift
//  FS20
//
//  Created by Mani on 26.01.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import Foundation
import CoreData

internal let g_coreData = CoreData()

class CoreData
{
    class var sharedCoreData: CoreData {
        return g_coreData
    }
    
    lazy var applicationDocumentsDirectory: NSURL = {
        return NSFileManager.defaultManager().containerURLForSecurityApplicationGroupIdentifier("group.FS20")!
        }()
    
    lazy var managedObjectModel: NSManagedObjectModel = {
        let modelURL = NSBundle.mainBundle().URLForResource("FS20", withExtension: "momd")!
        return NSManagedObjectModel(contentsOfURL: modelURL)!
        }()
    
    lazy var persistentStoreCoordinator: NSPersistentStoreCoordinator? = {
        var coordinator: NSPersistentStoreCoordinator? = NSPersistentStoreCoordinator(managedObjectModel: self.managedObjectModel)
        let url = self.applicationDocumentsDirectory.URLByAppendingPathComponent("FS20.sqlite")
        var error: NSError? = nil
        var failureReason = "There was an error creating or loading the application's saved data."
        if coordinator!.addPersistentStoreWithType(NSSQLiteStoreType, configuration: nil, URL: url, options: nil, error: &error) == nil {
            coordinator = nil

            var dict = [String: AnyObject]()
            dict[NSLocalizedDescriptionKey] = "Failed to initialize the application's saved data"
            dict[NSLocalizedFailureReasonErrorKey] = failureReason
            dict[NSUnderlyingErrorKey] = error
            error = NSError(domain: "YOUR_ERROR_DOMAIN", code: 9999, userInfo: dict)
            NSLog("Unresolved error \(error), \(error!.userInfo)")
            abort()
        }
        
        return coordinator
        }()
    
    lazy var managedObjectContext: NSManagedObjectContext? = {

        let coordinator = self.persistentStoreCoordinator
        if coordinator == nil {
            return nil
        }
        var managedObjectContext = NSManagedObjectContext()
        managedObjectContext.persistentStoreCoordinator = coordinator
        return managedObjectContext
        }()
    
    func saveContext () {
        if let moc = self.managedObjectContext {
            var error: NSError? = nil
            if moc.hasChanges && !moc.save(&error) {
                NSLog("Unresolved error \(error), \(error!.userInfo)")
            }
        }
    }
}

func fetchHouseEntries() -> [HouseEntry] {
    let managedContext = CoreData.sharedCoreData.managedObjectContext!
    
    let fetchRequest = NSFetchRequest(entityName: "HouseEntry")
    
    var error: NSError?
    let fetchedResults = managedContext.executeFetchRequest(fetchRequest, error: &error)
    if fetchedResults != nil {
        return fetchedResults! as [HouseEntry]
    }
    
    return []
}