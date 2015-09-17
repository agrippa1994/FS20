//
//  MainTableViewController.swift
//  FS20
//
//  Created by Manuel Stampfl on 30.07.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit


class MainTableViewController: UITableViewController, DeviceTableViewCellDelegate {
    
    // MARK: - Vars
    private var fs20: FS20?
    private var houses: [FS20.House] = []

    // MARK: - Storyboard actions
    @IBAction func onRefresh(sender: UIRefreshControl) {
        self.refreshWithAlertController(nil)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        self.navigationItem.rightBarButtonItem = self.editButtonItem()
        
        // Add observers
        let center = NSNotificationCenter.defaultCenter()
        center.addObserver(self, selector: Selector("appDidBecomeActive"), name: UIApplicationDidBecomeActiveNotification, object: nil)
    }

    override func viewDidDisappear(animated: Bool) {
        super.viewDidDisappear(animated)
        
        // Remove all observers
        let center = NSNotificationCenter.defaultCenter()
        center.removeObserver(self)
    }
    
    override func viewDidAppear(animated: Bool) {
        super.viewDidAppear(animated)
        
        // Validate settings otherwise show iOS Settings application
        self.validateAndApplySettings()
    }

    
    // MARK: - Table view data source
    override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return self.houses.count
    }

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return self.houses[section].devices.count
    }

    // MARK: - Table view delegate
    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("EntryCell", forIndexPath: indexPath) as! DeviceTableViewCell

        cell.titleLabel.text = self.houses[indexPath.section].devices[indexPath.row].name
        cell.delegate = self
        
        return cell
    }

    override func tableView(tableView: UITableView, canEditRowAtIndexPath indexPath: NSIndexPath) -> Bool {
        return true
    }

    override func tableView(tableView: UITableView, commitEditingStyle editingStyle: UITableViewCellEditingStyle, forRowAtIndexPath indexPath: NSIndexPath) {
        if editingStyle == .Delete {
            tableView.deleteRowsAtIndexPaths([indexPath], withRowAnimation: .Fade)
        }
    }

    override func tableView(tableView: UITableView, editActionsForRowAtIndexPath indexPath: NSIndexPath) -> [UITableViewRowAction]? {
        return [
            UITableViewRowAction(style: .Destructive, title: "DELETE".localized) { _, _ in
                
            },
            UITableViewRowAction(style: .Normal, title: "Timers") { _, _ in
                
            },
            UITableViewRowAction(style: .Normal, title: "Countdowns") { _, _ in
                
            }
        ]
    }
    
 
    override func tableView(tableView: UITableView, canMoveRowAtIndexPath indexPath: NSIndexPath) -> Bool {
        return false
    }

    override func tableView(tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
        return self.houses[section].name
    }
    
    override func tableView(tableView: UITableView, willDisplayHeaderView view: UIView, forSection section: Int) {
        (view as! UITableViewHeaderFooterView).textLabel?.textColor = UIColor.whiteColor()
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {

    }

    // MARK: - Device table view cell delegate
    func deviceTableViewCellEnable(cell: DeviceTableViewCell) {
        let path = self.tableView.indexPathForCell(cell)!
        self.houses[path.section].devices[path.row].enable()
    }
    
    func deviceTableViewCellDisable(cell: DeviceTableViewCell) {
        let path = self.tableView.indexPathForCell(cell)!
        self.houses[path.section].devices[path.row].disable()
    }
    
    // MARK: - Selectors
    func appDidBecomeActive() {
        self.validateAndApplySettings()
    }
    
    // MARK: - Methods
    func validateAndApplySettings() {
        // Read server host from iOS Settings application
        if let host = NSUserDefaults.standardUserDefaults().valueForKey("Host") as? String {
            if let url = NSURL(string: host) {
                // Create FS20 object if it's not initialized otherwise set the url
                if self.fs20 == nil {
                    self.fs20 = FS20(url: url)
                } else {
                    self.fs20?.url = url
                }
                
                // Refresh data
                self.refreshWithAlertController(nil)
                return
            }
        }
        
        // Open Settings
        UIApplication.sharedApplication().openURL(NSURL(string: UIApplicationOpenSettingsURLString)!)
    }
    
    func refresh(completion: (Bool -> Void)?) {
        if self.fs20 == nil {
            completion?(false)
            return
        }
        
        self.refreshControl?.beginRefreshing()
        self.fs20?.houses { houses in
            dispatch_async(dispatch_get_main_queue()) {
                defer {
                    self.refreshControl?.endRefreshing()
                }
                
                if houses == nil {
                    completion?(false)
                    return
                }
                
                self.houses = houses!
                self.tableView.reloadData()
                completion?(true)
            }
        }
    }
    
    func refreshWithAlertController(completion: (Bool -> Void)?) {
        self.refresh { success in
            defer {
                completion?(success)
            }
            
            if success {
                return
            }
            
            let controller = UIAlertController(title: "ERROR".localized, message: "MAINTABLEVIEWCONTROLLER_REFRESH_ERROR".localized, preferredStyle: .Alert)
            controller.addAction(UIAlertAction(title: "OK", style: .Default, handler: nil))
            self.presentViewController(controller, animated: true, completion: nil)
        }
    }
}
