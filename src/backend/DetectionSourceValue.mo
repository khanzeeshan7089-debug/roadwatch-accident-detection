import OQL "mo:caffeineai-oql";

// OQL value conversion for the incident detection-source variant.
module {
  public func _toRow(self : { #simulated; #model }) : OQL.Value =
    #text(
      switch self {
        case (#simulated) { "simulated" };
        case (#model) { "model" };
      }
    );
};
