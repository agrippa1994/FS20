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

    var parentHouse: HouseEntry!
    
    var devices: [DeviceEntry] {
        return parentHouse.devices.allObjects as [DeviceEntry]
    }
    
    func addEditChannelTableViewControllerDidCancel(view: AddEditChannelTableViewController) {
        view.dismissViewControllerAnimated(true, completion: nil)
    }
    
    func addEditChannelTableViewController(view: AddEditChannelTableViewController, isValidChannelWithChannelName channelName:String, withChannelCode channelCode: String, withShowInNotificationCenter showInNotificationCenter: Bool) -> Bool {
        if channelName.isEmpty || channelCode.isEmpty {
            return false
        }
        
        let channelCodeInt = channelCode.toInt()
        if channelCodeInt == nil {
            return false
        }
        
        if !isHouseCode(channelCodeInt!) {
            return false
        }
        
        return true
    }
    
    func addEditChannelTableViewController(view: AddEditChannelTableViewController, withChannelName channelName: String, withChannelCode channelCode: String, withShowInNotificationCenter showInNotificationCenter: Bool) {
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
    }
    
    func channelTableViewDidEnableButtonClicked(cell: ChannelTableViewCell) {
        
        let device = devices[self.tableView.indexPathForCell(cell)!.row]
        
        executeFS20CommandOnce(
            parentHouse.host,
            parentHouse.hc1.integerValue,
            parentHouse.hc2.integerValue,
            device.adr.integerValue,
            0x11,
            0x00
        ) {
            if $0 != nil {
                NSLog("Success")
            } else {
                NSLog("Error")
            }
        }
    }
    
    func channelTableViewDidDisableButtonClicked(cell: ChannelTableViewCell) {
        let device = devices[self.tableView.indexPathForCell(cell)!.row]
        
        executeFS20CommandOnce(
            parentHouse.host,
            parentHouse.hc1.integerValue,
            parentHouse.hc2.integerValue,
            device.adr.integerValue,
            0x00,
            0x00
            ) {
                if $0 != nil {
                    NSLog("Success")
                } else {
                    NSLog("Error")
                }
        }

    }
    
    func channelTableViewDidToggleButtonClicked(cell: ChannelTableViewCell) {
        let device = devices[self.tableView.indexPathForCell(cell)!.row]
        
        executeFS20CommandOnce(
            parentHouse.host,
            parentHouse.hc1.integerValue,
            parentHouse.hc2.integerValue,
            device.adr.integerValue,
            0x12,
            0x00
            ) {
                if $0 != nil {
                    NSLog("Success")
                } else {
                    NSLog("Error")
                }
        }

    }
    
    func onAdd(sender: AnyObject) {
        self.performSegueWithIdentifier("AddEditChannel", sender: sender)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Add navigation items
        let addButton = UIBarButtonItem(barButtonSystemItem: .Add, target: self, action: Selector("onAdd:"))
        self.navigationItem.rightBarButtonItems = [self.editButtonItem(), addButton]
        
        // Allow the selection of cells during editing
        self.tableView.allowsSelectionDuringEditing = true
        
        // Set the title
        self.navigationItem.title = parentHouse.name
    }

    override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
    }

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return devices.count
    }
    
    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("ChannelCell", forIndexPath: indexPath) as ChannelTableViewCell

        let device = parentHouse.devices.allObjects[indexPath.row] as DeviceEntry
        
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
            let objectToDelete = devices[indexPath.row]
        
            parentHouse.removeDevicesObject(objectToDelete)
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
        return 61.0
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
