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
    private var fs20: FS20?
    private var rooms: [FS20.Room] = []

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
        let path = self.tableView.indexPathForCell(cell)!
        self.rooms[path.section].devices[path.row].enable()
    }
    
    func deviceTableViewCellDisable(cell: DeviceTableViewCell) {
        let path = self.tableView.indexPathForCell(cell)!
        self.rooms[path.section].devices[path.row].disable()
    }
    
    // MARK: - Methods
    func validateAndApplySettings() {
        // Read server host from iOS Settings application
        if let url = NSURL(string: Settings.host) {
            // Create FS20 object if it's not initialized otherwise set the url
            if self.fs20 == nil {
                self.fs20 = FS20(url: url)
            } else {
                self.fs20?.url = url
            }
            
            // Refresh data
            self.refresh {
                if $0 {
                    self.refreshSucceeded()
                } else {
                    self.refreshFailed()
                }
            }
            
            return
        }
        
        self.invalidUrl()
    }
    
    func refresh(completion: (Bool -> Void)?) {
        if self.fs20 == nil {
            completion?(false)
            return
        }
        
        self.refreshControl?.beginRefreshing()
        self.fs20?.rooms { rooms in
            dispatch_async(dispatch_get_main_queue()) {
                defer {
                    self.refreshControl?.endRefreshing()
                }
                
                if rooms == nil {
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
