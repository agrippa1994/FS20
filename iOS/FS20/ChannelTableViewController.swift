//
//  ChannelTableViewController.swift
//  FS20
//
//  Created by Mani on 28.01.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit
import CoreData

class ChannelTableViewController: UITableViewController, AddEditChannelTableViewControllerDelegate, ChannelTableViewCellDelegate {
    // MARK: - Variables
    var parentHouse: HouseEntry!
    
    // MARK: - Computed variables
    var devices: [DeviceEntry] {
        return (parentHouse.devices.allObjects as [DeviceEntry]).sorted {
            ($0.adr as Int) < ($1.adr as Int)
        }
    }
    
    // MARK: - AddEditChannelTableViewControllerDelegate
    func addEditChannelTableViewControllerDidCancel(view: AddEditChannelTableViewController) {
        view.dismissViewControllerAnimated(true, completion: nil)
    }
    
    func addEditChannelTableViewController(view: AddEditChannelTableViewController, withChannelName channelName: String, withChannelCode channelCode: String, withShowInNotificationCenter showInNotificationCenter: Bool) -> String? {
        
        if channelName.isEmpty || channelCode.isEmpty {
            return localizedString("ERROR_EMPTY")
        }
        
        let channelCodeInt = channelCode.toInt()
        if channelCodeInt == nil {
            return localizedString("ERROR_NO_HC_OR_ADR")
        }
        
        if !isHouseCode(channelCodeInt!) {
            return localizedString("ERROR_NO_HC_OR_ADR")
        }

        
        let context = CoreData.sharedCoreData.managedObjectContext!
        
        var device: DeviceEntry!
        if let cell = view.sender as? UITableViewCell {
            device = devices[self.tableView.indexPathForCell(cell)!.row]
        } else {
            device =  NSEntityDescription.insertNewObjectForEntityForName("DeviceEntry", inManagedObjectContext: context) as? DeviceEntry
            parentHouse.addDevicesObject(device)
        }
       
        device.name = channelName
        device.adr = NSNumber(short: (Int16(channelCode.toInt()!)))
        device.showInNC = showInNotificationCenter
        device.house = parentHouse
        
        CoreData.sharedCoreData.saveContext()
        self.tableView.reloadData()
        
        view.dismissViewControllerAnimated(true, completion: nil)
        return nil
    }
    
    // MARK: - ChannelTableViewCellDelegate
    func channelTableView(cell: ChannelTableViewCell, withAction action: Int) {
        let actionType = ChannelTableViewActionType(rawValue: action)!
        let device = devices[self.tableView.indexPathForCell(cell)!.row]
        let host = parentHouse.host
        let hc1 = parentHouse.hc1.integerValue
        let hc2 = parentHouse.hc2.integerValue
        let adr = device.adr.integerValue
        var bef: Byte
        
        switch actionType {
        case .Enable: bef = 0x11
        case .Disable: bef = 0x00
        }
        
        executeFS20CommandOnce(host, hc1, hc2, adr, bef, 0x00) { (error: NSError?) -> Void in
            if error != nil {
                
                // Show the alert view in the gui's main thread
                dispatch_async(dispatch_get_main_queue()) {
                    UIAlertView(title: "Error", message: error!.localizedDescription, delegate: nil, cancelButtonTitle: "OK").show()
                }
            }
        }
    }

    // MARK: - Custom selectors
    func onAdd(sender: AnyObject) {
        self.performSegueWithIdentifier("AddEditChannel", sender: sender)
    }
    
    // MARK: - Overrided base methods
    override func viewDidLoad() {
        super.viewDidLoad()

        // Allow the selection of cells during editing
        self.tableView.allowsSelectionDuringEditing = true
        self.tableView.allowsSelection = false
        
        // Set the title
        self.navigationItem.title = parentHouse.name
        
        // Set toolbar items
        let addButton = UIBarButtonItem(barButtonSystemItem: .Add, target: self, action: Selector("onAdd:"))
        let spaceButton = UIBarButtonItem(barButtonSystemItem: .FlexibleSpace, target: nil, action: nil)
        self.setToolbarItems([addButton, spaceButton, self.editButtonItem()], animated: false)
        self.navigationController?.toolbarHidden = false
    }

    override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
    }

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return devices.count
    }
    
    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("ChannelCell", forIndexPath: indexPath) as ChannelTableViewCell

        let device = self.devices[indexPath.row]
        
        cell.delegate = self
        cell.title.text = device.name
        cell.subtitle.text = "\(device.adr)"
        
        return cell
    }
    
    override func tableView(tableView: UITableView, canEditRowAtIndexPath indexPath: NSIndexPath) -> Bool {
        return true
    }

    override func tableView(tableView: UITableView, commitEditingStyle editingStyle: UITableViewCellEditingStyle, forRowAtIndexPath indexPath: NSIndexPath) {
        
        if editingStyle == .Delete {
            let objectToDelete = self.devices[indexPath.row]
            
            // Delete the device
            parentHouse.removeDevicesObject(objectToDelete)
            CoreData.sharedCoreData.managedObjectContext!.deleteObject(objectToDelete)
            CoreData.sharedCoreData.saveContext()
            
            tableView.deleteRowsAtIndexPaths([indexPath], withRowAnimation: .Fade)
        }
    }
    
    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        tableView.deselectRowAtIndexPath(indexPath, animated: true)
        
        if tableView.editing {
            let cell = tableView.cellForRowAtIndexPath(indexPath)!
            self.performSegueWithIdentifier("AddEditChannel", sender: cell)
        }
    }
    override func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
        return 100.0
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if segue.identifier == "AddEditChannel" {
            if let navigationVC = segue.destinationViewController as? UINavigationController {
                if let vc = navigationVC.topViewController as? AddEditChannelTableViewController {
                    vc.delegate = self
                    vc.sender = sender
                    
                    if let cell = sender as? UITableViewCell { // In editing - mode
                        let idx = tableView.indexPathForCell(cell)!.row
                        
                        let device = devices[idx]
                        
                        vc.channelName = device.name
                        vc.channelCode = Int16(device.adr.intValue)
                        vc.showInNotificationCenter = device.showInNC.boolValue
                    }
                }
            }
        }
    }
}
