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
    
    // Return a valid string object if an error occured
    // This string will be shown inside a message
    func addEditChannelTableViewController(
        view: AddEditChannelTableViewController,
        withChannelName channelName: String,
        withChannelCode channelCode: String,
        withShowInNotificationCenter showInNotificationCenter: Bool
    ) -> String?
}

class AddEditChannelTableViewController: UITableViewController, UITextFieldDelegate {
    // MARK: - Variables
    weak var delegate: AddEditChannelTableViewControllerDelegate?
    weak var sender: AnyObject?
    
    var channelName: String?
    var channelCode: Int16?
    var showInNotificationCenter: Bool?
    
    // MARK: - Storyboard outlets
    @IBOutlet var textFields: [UITextField]!
    @IBOutlet var showInNotificationCenterSwitch: UISwitch!
    
    // MARK: - Storyboard actions
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
        
        if let message =  delegate!.addEditChannelTableViewController(self, withChannelName: name, withChannelCode: code, withShowInNotificationCenter: showInNC){
            UIAlertView(title: localizedString("ERROR_TITLE"), message: message, delegate: nil, cancelButtonTitle: "OK").show()
        }
    }
    
    // MARK: - Overrided base methods
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
        
        for textField in textFields {
            textField.delegate = self
        }
    }
    
    override func viewDidAppear(animated: Bool) {
        super.viewDidAppear(animated)
        textFields[0].becomeFirstResponder()
    }
    
    // MARK: - UITextFieldDelegate
    func textFieldShouldReturn(textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }
}
