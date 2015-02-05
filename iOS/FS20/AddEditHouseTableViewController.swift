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
    
    func addEditHouseTableViewController(
        view: AddEditHouseTableViewController,
        isValidDataWithHouseName houseName: String,
        withHouseHost houseHost: String,
        withHouseCode1 houseCode1: String,
        withHouseCode2 houseCode2: String
    ) -> Bool
    
    func addEditHouseTableViewController(
        view: AddEditHouseTableViewController,
        withHouseName houseName: String,
        withHouseHost houseHost: String,
        withHouseCode1 houseCode1: String,
        withHouseCode2 houseCode2: String
    )
}

class AddEditHouseTableViewController: UITableViewController, UITextFieldDelegate {
    weak var delegate: AddEditHouseTableViewControllerDelegate?
    weak var sender: AnyObject?
    
    var houseName: String?
    var houseHost: String?
    var houseCode1: Int16?
    var houseCode2: Int16?
    
    @IBOutlet var textFields: [UITextField]!
    
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
        
        if delegate!.addEditHouseTableViewController(self, isValidDataWithHouseName: name, withHouseHost: host, withHouseCode1: hc1, withHouseCode2: hc2) {
            delegate!.addEditHouseTableViewController(self, withHouseName: name, withHouseHost: host, withHouseCode1: hc1, withHouseCode2: hc2)
        } else {
            UIAlertView(title: "Error", message: "Invalid data", delegate: nil, cancelButtonTitle: "OK").show()
        }
    }
    
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
    
    func textFieldShouldReturn(textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }
}
