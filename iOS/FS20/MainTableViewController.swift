//
//  MainTableViewController.swift
//  FS20
//
//  Created by Manuel Stampfl on 30.07.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit


class MainTableViewController: BaseFS20TableViewController {
    
    // MARK: - Storyboard actions
    @IBAction func onRefresh(sender: UIRefreshControl) {
        self.refreshWithAlertController(nil)
    }
    
    // MARK: - BaseFS20TableViewController
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

    override func tableView(tableView: UITableView, canEditRowAtIndexPath indexPath: NSIndexPath) -> Bool {
        return true
    }

    override func tableView(tableView: UITableView, commitEditingStyle editingStyle: UITableViewCellEditingStyle, forRowAtIndexPath indexPath: NSIndexPath) {
        if editingStyle == .Delete {
            tableView.deleteRowsAtIndexPaths([indexPath], withRowAnimation: .Fade)
        }
    }

    override func tableView(tableView: UITableView, canMoveRowAtIndexPath indexPath: NSIndexPath) -> Bool {
        return false
    }
    
    override func invalidUrl() {
        // Open Settings
        UIApplication.sharedApplication().openURL(NSURL(string: UIApplicationOpenSettingsURLString)!)
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {

    }

    // MARK: - Selectors
    func appDidBecomeActive() {
        self.validateAndApplySettings()
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
