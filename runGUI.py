import gi
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk
from dataSet import *

#class displaySetPage(
class gadroRep:
    
    """This class houses the GUI and integrates the data transfer between the GUI and the DB"""

    # Button click function definitions:

    def BrowseDataButtonClicked(self, button):
        self.currentBrowsePage = self.createBrowsePage()
        self.currentBrowsePage.show_all()

    def onDeleteMain(self, *args):
        Gtk.main_quit(*args)

    def onDeleteWindow(self, *args):
        args[0].hide()
        return True

    # Function below needs to be fleshed out
    def SearchButtonClicked(self, button):
        pass

    def OpenStimButtonNewFileClicked(self, button):
        """open window that shows currently known stim files and offers options to add new stim files"""
        pass
        #self.AddDataSet.
        #self.stimFileChooser.show_all()

    def OpenDataFileButtonNewFileClicked(self, button):
        """open window that shows currently known data files and offers options to add new data files"""
        name=self.builder.get_object('EnterName')
        print(name.get_text())

    def HelpButtonClicked(self, button):
        self.HelpScreen = self.builder.get_object('HelpScreen')
        self.HelpScreen.show()

    def QuitButtonClicked(self, button):
        Gtk.main_quit()

    def AddNewButtonClicked(self, button):
        self.AddDataSet = self.builder.get_object('AddDataSet')
        self.AddDataSet.show_all()

    def testGetChildren(self, button):
        for x in button.get_parent().get_children():
            print(Gtk.Buildable.get_name(x))

    def FileChooserCancelButtonClicked(self, button):
        self.onDeleteWindow(button.get_toplevel())

    def FileChooserAddButtonClicked(self, button):
        print(button.get_toplevel().get_filenames())

    def destroyBrowse(self, *args):
        """Destroys old browse window when closed to lower required resources"""
        if(self.currentBrowsePage != None):
            self.currentBrowsePage.destroy()
            self.currentBrowsePage = None
            return True
        return False

    def clearAddDataWindow(self):
        """clears the AddDataSet window so none of the entries are filled if it is re-opened"""

    def __init__(self):
        self.builder = Gtk.Builder()
        self.builder.add_from_file('avogadroGUI.glade')

        self.builder.connect_signals(self)

        self.MainMenu = self.builder.get_object('MainMenu')
        self.MainMenu.show_all()
        self.stimFileChooser = self.builder.get_object('stimFileChooser')
        self.db = dataDB()

    def createBrowsePage(self):
        browseWindow = Gtk.Window()
        nbook = Gtk.Notebook()
        browseWindow.add(nbook)
        browseWindow.resize(400,400)
        nbook.set_tab_pos(Gtk.PositionType(0))
        for dset in self.db.sets:
            temp = Gtk.Grid()
            temp.set_row_spacing(4)
            temp.insert_column(0)
            temp.insert_column(1)
            temp.insert_row(0)
            temp.insert_row(1)
            temp.insert_row(2)
            temp.insert_row(3)
            temp.insert_row(4)

            nbook.append_page(temp, Gtk.Label(dset.name))
            temp.attach(Gtk.Label('Date: '), 0,0,1,1)
            temp.attach(Gtk.Label('Publications: '), 0,1,1,1)
            temp.attach(Gtk.Label('Experimenter: '), 0,2,1,1)
            temp.attach(Gtk.Label('Stimuli: '), 0,3,1,1)

            temp.attach(Gtk.Label(dset.date), 1,0,1,1)
            temp.attach(Gtk.Label(dset.publications), 1,1,1,1)
            temp.attach(Gtk.Label(dset.experimenter), 1,2,1,1)
            temp.attach(Gtk.Label(dset.stimuli), 1,3,1,1)

            a = Gtk.Button('View data set files, stimuli, and locations')
            a.connect('clicked', self.ShowFiles)
            temp.attach(a, 0,4,2,1)
        browseWindow.connect('delete-event', self.destroyBrowse)
        return browseWindow


    def ShowFiles(self, button):
        pass

if __name__ == "__main__":
    main = gadroRep()
    Gtk.main()
