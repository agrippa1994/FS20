//
//  AddEditChannelTableViewController.swift
//  FS20
//
//  Created by Mani on 28.01.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit

@objc protocol AddEditChannelTableViewControllerDelegate {
    
    func addEditChannelTableViewControllerDidCancel(
        view: AddEditChannelTableViewController
    )
    
    func addEditChannelTableViewController(
        view: AddEditChannelTableViewController,
        isValidChannelWithChannelName channelName: String,
        withChannelCode channelCode: String,
        withShowInNotificationCenter showInNotificationCenter: Bool
    ) -> Bool
    
    func addEditChannelTableViewController(
        view: AddEditChannelTableViewController,
        withChannelName channelName: String,
        withChannelCode channelCode: String,
        withShowInNotificationCenter showInNotificationCenter: Bool
    )
}

class AddEditChannelTableViewController: UITableViewController {
    weak var delegate: AddEditChannelTableViewControllerDelegate?
    weak var sender: AnyObject?
    
    var channelName: String?
    var channelCode: Int16?
    var showInNotificationCenter: Bool?
    
    @IBOutlet var textFields: [UITextField]!
    @IBOutlet var showInNotificationCenterSwitch: UISwitch!
    
    @IBAction func onCancel(sender: AnyObject) {
        delegate?.addEditChannelTableViewControllerDidCancel(self)
    }
    
    @IBAction func onSave(sender: AnyObject) {
        if delegate == nil {
            return
        }
        
        let name = textFields[0].text
        let code = textFields[1].text
        let showInNC = showInNotificationCenterSwitch.on
        
        if delegate!.addEditChannelTableViewController(self, isValidChannelWithChannelName: name, withChannelCode: code, withShowInNotificationCenter: showInNC) {
            delegate!.addEditChannelTableViewController(self, withChannelName: name, withChannelCode: code, withShowInNotificationCenter: showInNC)
        } else {
            UIAlertView(title: "Error", message: "Invalid data", delegate: nil, cancelButtonTitle: "OK").show()
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        if channelName != nil {
            textFields[0].text = channelName!
        }
        
        if channelCode != nil {
            textFields[1].text = "\(channelCode!)"
        }
        
        if showInNotificationCenter != nil {
            showInNotificationCenterSwitch.setOn(showInNotificationCenter!, animated: false)
        }
    }
}
