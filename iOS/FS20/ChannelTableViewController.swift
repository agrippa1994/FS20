//
//  ChannelTableViewController.swift
//  FS20
//
//  Created by Mani on 28.01.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit

class ChannelTableViewController: UITableViewController {

    func onAdd(sender: AnyObject?) {
        
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        
        let addButton = UIBarButtonItem(barButtonSystemItem: .Add, target: self, action: Selector("onAdd:"))
         self.navigationItem.rightBarButtonItems = [self.editButtonItem(), addButton]
    }

    override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
    }

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        // #warning Incomplete method implementation.
        // Return the number of rows in the section.
        return 0
    }

    
    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("ChannelCell", forIndexPath: indexPath) as UITableViewCell

        // Configure the cell...

        return cell
    }
    
    override func tableView(tableView: UITableView, canEditRowAtIndexPath indexPath: NSIndexPath) -> Bool {
        return true
    }


    /*
    // Override to support editing the table view.
    override func tableView(tableView: UITableView, commitEditingStyle editingStyle: UITableViewCellEditingStyle, forRowAtIndexPath indexPath: NSIndexPath) {
        if editingStyle == .Delete {
            // Delete the row from the data source
            tableView.deleteRowsAtIndexPaths([indexPath], withRowAnimation: .Fade)
        } else if editingStyle == .Insert {
            // Create a new instance of the appropriate class, insert it into the array, and add a new row to the table view
        }    
    }
    */

    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using [segue destinationViewController].
        // Pass the selected object to the new view controller.
    }
}
