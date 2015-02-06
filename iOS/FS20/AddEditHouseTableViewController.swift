//
//  AddEditHouseTableViewController.swift
//  FS20
//
//  Created by Mani on 25.01.15.
//  Copyright (c) 2015 Mani. All rights reserved.
//

import UIKit

@objc protocol AddEditHouseTableViewControllerDelegate {
    
    func addEditHouseTableViewControllerDidCancel(
        view : AddEditHouseTableViewController
    )
    
    // Return a valid string object if an error occured
    // This string will be shown inside a message
    func addEditHouseTableViewController(
        view: AddEditHouseTableViewController,
        withHouseName houseName: String,
        withHouseHost houseHost: String,
        withHouseCode1 houseCode1: String,
        withHouseCode2 houseCode2: String
    ) -> String?
}

class AddEditHouseTableViewController: UITableViewController, UITextFieldDelegate {
    // MARK: - Variables
    weak var delegate: AddEditHouseTableViewControllerDelegate?
    weak var sender: AnyObject?
    
    var houseName: String?
    var houseHost: String?
    var houseCode1: Int16?
    var houseCode2: Int16?
    
    // MARK: - Storyboard outlets
    @IBOutlet var textFields: [UITextField]!
    
    // MARK: - Storyboard actions
    @IBAction func onClose(sender: AnyObject) {
        delegate?.addEditHouseTableViewControllerDidCancel(self)
    }
    
    @IBAction func onSave(sender: AnyObject) {
        if delegate == nil {
            return
        }
        
        let name = textFields[0].text
        let host = textFields[1].text
        let hc1 = textFields[2].text
        let hc2 = textFields[3].text
        
        if let message = delegate!.addEditHouseTableViewController(self, withHouseName: name, withHouseHost: host, withHouseCode1: hc1, withHouseCode2: hc2) {
            UIAlertView(title: localizedString("ERROR_TITLE"), message: message, delegate: nil, cancelButtonTitle: "OK").show()
        }
    }
    
    // MARK: - Overrided base methods
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if houseName != nil {
            textFields[0].text = houseName!
        }
        
        if houseHost != nil {
            textFields[1].text = houseHost!
        }
        
        if houseCode1 != nil {
           textFields[2].text = "\(houseCode1!)"
        }
        
        if houseCode2 != nil {
            textFields[3].text = "\(houseCode2!)"
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
