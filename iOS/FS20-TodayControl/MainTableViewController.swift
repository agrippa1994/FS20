//
//  MainTableViewController.swift
//  FS20
//
//  Created by Mani on 02.02.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit
import NotificationCenter

class MainTableViewController: UITableViewController, NCWidgetProviding, DeviceTableViewCellDelegate {

    var devices: [DeviceEntry] {
        let ctx = CoreData.sharedCoreData.managedObjectContext!
        
        let fetchRequest = NSFetchRequest(entityName: "DeviceEntry")
        
        var fetchedDevices = [DeviceEntry]()
        let fetchedResults = ctx.executeFetchRequest(fetchRequest, error: nil)
        if fetchedResults != nil {
            fetchedDevices = fetchedResults as [DeviceEntry]
        }
        
        var devicesForNC = [DeviceEntry]()
        for i in fetchedDevices {
            if i.showInNC.boolValue {
                devicesForNC.append(i)
            }
        }
        
        return devicesForNC
    }
    
    func deviceTableViewCell(view: DeviceTableViewCell, withAction action: Int) {
        let actionType = DeviceTableViewActionType(rawValue: action)!
        
        let device = self.devices[self.tableView.indexPathForCell(view)!.row]
        let parentHouse = device.house
        let host = parentHouse.host
        let hc1 = parentHouse.hc1.integerValue
        let hc2 = parentHouse.hc2.integerValue
        let adr = device.adr.integerValue
        var bef: Byte
        
        switch actionType {
        case .Enable:
            bef = 0x11
        case .Disable:
            bef = 0x00
        }
        
        executeFS20CommandOnce(host, hc1, hc2, adr, bef, 0x00) { error -> Void in
            return
        }
    }
    
    func widgetPerformUpdateWithCompletionHandler(completionHandler: ((NCUpdateResult) -> Void)!) {
        completionHandler(NCUpdateResult.NewData)
    }
    
    func widgetMarginInsetsForProposedMarginInsets(defaultMarginInsets: UIEdgeInsets) -> UIEdgeInsets {
        return UIEdgeInsets(top: 0.0, left: 0.0, bottom: 0.0, right: 0.0)
    }
    // MARK: - Table view data source

    override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
    }

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return devices.count
    }

    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("DeviceCell", forIndexPath: indexPath) as DeviceTableViewCell

        let device = self.devices[indexPath.row]
        cell.delegate = self
        cell.houseLabel.text = device.house.name
        cell.deviceLabel.text = device.name
        cell.codeLabel.text = "\(device.house.hc1) \(device.house.hc2) \(device.adr)"
        
        self.preferredContentSize = self.tableView.contentSize
        
        return cell
    }
}
