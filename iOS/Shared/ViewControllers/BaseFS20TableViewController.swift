//
//  MainTableViewController.swift
//  FS20
//
//  Created by Manuel Stampfl on 30.07.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit


class BaseFS20TableViewController: UITableViewController, DeviceTableViewCellDelegate {
    
    // MARK: - Vars
    private var rooms: [Room] = []

    override func viewDidAppear(animated: Bool) {
        super.viewDidAppear(animated)
        
        // Validate settings otherwise show iOS Settings application
        self.validateAndApplySettings()
    }
    
    // MARK: - Table view data source
    override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return self.rooms.count
    }

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return self.rooms[section].devices.count
    }

    // MARK: - Table view delegate
    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("EntryCell", forIndexPath: indexPath) as! DeviceTableViewCell

        cell.titleLabel.text = self.rooms[indexPath.section].devices[indexPath.row].name
        cell.delegate = self
        
        return cell
    }

    override func tableView(tableView: UITableView, canEditRowAtIndexPath indexPath: NSIndexPath) -> Bool {
        return false
    }
 
    override func tableView(tableView: UITableView, canMoveRowAtIndexPath indexPath: NSIndexPath) -> Bool {
        return false
    }

    override func tableView(tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
        return self.rooms[section].name
    }
    
    override func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
        return 75.0
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {

    }

    // MARK: - Device table view cell delegate
    func deviceTableViewCellEnable(cell: DeviceTableViewCell) {
        let indexPath = self.tableView.indexPathForCell(cell)!
        let device = self.rooms[indexPath.section].devices[indexPath.row]
        device.setDeviceState(true, atHost: "10.0.0.50:8888", withCompletion: nil)
        //self.rooms[path.section].devices[path.row].enable()
    }
    
    func deviceTableViewCellDisable(cell: DeviceTableViewCell) {
        let indexPath = self.tableView.indexPathForCell(cell)!
        let device = self.rooms[indexPath.section].devices[indexPath.row]
        device.setDeviceState(false, atHost: "10.0.0.50:8888", withCompletion: nil)
    }
    
    // MARK: - Methods
    func validateAndApplySettings() {
        // Read server host from iOS Settings application

            
            // Refresh data
            self.refresh {
                if $0 {
                    self.refreshSucceeded()
                } else {
                    self.refreshFailed()
                }
            }
            
    
    }
    
    func refresh(completion: (Bool -> Void)?) {
        self.refreshControl?.beginRefreshing()
        Room.fetchDataFromHost("10.0.0.50:8888") { error, rooms in
            dispatch_async(dispatch_get_main_queue()) {
                defer {
                    self.refreshControl?.endRefreshing()
                }
                
                if rooms == nil || error != nil {
                    completion?(false)
                    return
                }
                
                self.rooms = rooms!
                self.tableView.reloadData()
                completion?(true)
            }
        }
    }
    
    func invalidUrl() {
        
    }
    
    func refreshFailed() {
        
    }
    
    func refreshSucceeded() {
        
    }
}
