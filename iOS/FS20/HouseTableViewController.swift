//
//  HouseTableViewController.swift
//  FS20
//
//  Created by Mani on 25.01.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit
import CoreData

class HouseTableViewController: UITableViewController, AddEditHouseTableViewControllerDelegate {
    var addEditHouseVC: AddEditHouseTableViewController?
    
    var houses: [HouseEntry] {
        return fetchHouseEntries()
    }
    
    @IBAction func onAdd(sender: AnyObject) {
        self.performSegueWithIdentifier("AddEditHouse", sender: sender)
    }
    
    func addEditHouseTableViewControllerDidCancel(view: AddEditHouseTableViewController) {
        view.dismissViewControllerAnimated(true, completion: nil)
    }
    
    func addEditHouseTableViewController(view: AddEditHouseTableViewController, isValidDataWithHouseName houseName: String, withHouseHost houseHost: String, withHouseCode1 houseCode1: String, withHouseCode2 houseCode2: String) -> Bool {
        
        if houseName.isEmpty || houseHost.isEmpty || houseCode1.isEmpty || houseCode2.isEmpty {
            return false
        }
        
        if NSURL(string: houseHost) == nil {
            return false
        }
        
        let iHc1 = houseCode1.toInt()
        let iHc2 = houseCode2.toInt()
        
        if iHc1 == nil || iHc2 == nil {
            return false
        }
        
        if !isHouseCode(iHc1!) || !isHouseCode(iHc2!){
            return false
        }
        
        return true
    }
    
    func addEditHouseTableViewController(view: AddEditHouseTableViewController, withHouseName houseName: String, withHouseHost houseHost: String, withHouseCode1 houseCode1: String, withHouseCode2 houseCode2: String) {

        let managedContext = CoreData.sharedCoreData.managedObjectContext!
        
        // Is in editing mode because a table view cell is the sender
        if let sender: UITableViewCell = view.sender as? UITableViewCell {
            let idx = self.tableView.indexPathForCell(sender)!.row
            
            let house = houses[idx]
            house.name = houseName
            house.host = houseHost
            house.hc1 = NSNumber(short: (Int16(houseCode1.toInt()!)))
            house.hc2 = NSNumber(short: (Int16(houseCode2.toInt()!)))
        }
        
        // Add a new entry
        else {
            var entry = NSEntityDescription.insertNewObjectForEntityForName("HouseEntry", inManagedObjectContext: managedContext) as HouseEntry
            entry.name = houseName
            entry.host = houseHost
            entry.hc1 = NSNumber(short: (Int16(houseCode1.toInt()!)))
            entry.hc2 = NSNumber(short: (Int16(houseCode2.toInt()!)))
        }
        
        CoreData.sharedCoreData.saveContext()
        self.tableView.reloadData()
        
        view.dismissViewControllerAnimated(true, completion: nil)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.navigationItem.leftBarButtonItem = self.editButtonItem()
        self.tableView.allowsSelectionDuringEditing = true
    }

    override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
    }

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return houses.count
    }

    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("HouseCell", forIndexPath: indexPath) as UITableViewCell

        let house = houses[indexPath.row]
        cell.textLabel?.text = house.name
        cell.detailTextLabel?.text = "\(house.hc1) \(house.hc2)"
        
        return cell
    }
    
    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        tableView.deselectRowAtIndexPath(indexPath, animated: true)
        
        let sender = tableView.cellForRowAtIndexPath(indexPath)!
        if tableView.editing {
            self.performSegueWithIdentifier("AddEditHouse", sender: sender)
        } else {
            self.performSegueWithIdentifier("EnterHouse", sender: sender)
        }
    }
 
    override func tableView(tableView: UITableView, canEditRowAtIndexPath indexPath: NSIndexPath) -> Bool {
        return true
    }

    override func tableView(tableView: UITableView, commitEditingStyle editingStyle: UITableViewCellEditingStyle, forRowAtIndexPath indexPath: NSIndexPath) {
        
        if editingStyle == .Delete {
            CoreData.sharedCoreData.managedObjectContext!.deleteObject(houses[indexPath.row])
            CoreData.sharedCoreData.saveContext()
            
            tableView.deleteRowsAtIndexPaths([indexPath], withRowAnimation: .Fade)
        }
    }

    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        
        if segue.identifier == "AddEditHouse" {
            if let navigationVC = segue.destinationViewController as? UINavigationController {
                if let vc = navigationVC.topViewController as? AddEditHouseTableViewController {
                    vc.delegate = self
                    vc.sender = sender
                    
                    if let cell = sender as? UITableViewCell { // Editing
                        let idx = self.tableView.indexPathForCell(cell)!.row
                        
                        let house = houses[idx]
                        vc.houseName = house.name
                        vc.houseHost = house.host
                        vc.houseCode1 = Int16(house.hc1.shortValue)
                        vc.houseCode2 = Int16(house.hc2.shortValue)
                    }
                }
            }
        } else if segue.identifier == "EnterHouse" {
            let tableViewCell = sender as UITableViewCell
            let index = self.tableView.indexPathForCell(tableViewCell)!.row
            
            let house = houses[index]
            
            let vc = segue.destinationViewController as ChannelTableViewController
            vc.parentHouse = house
        }
    }
}
